import { Client, Guild, Message, TextChannel, User } from 'discord.js';
import prismaClient from '@yurna/database';

export class TicketArchiver {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Archiviert ein Ticket mit allen Nachrichten und Benutzerinteraktionen
   * @param ticketId ID des zu archivierenden Tickets
   * @param channel Der Discord-Kanal des Tickets
   */
  async archiveTicket(ticketId: string, channel: TextChannel): Promise<boolean> {
    try {
      // Ticket-Daten aus der Datenbank abrufen
      const ticket = await prismaClient.ticket.findUnique({
        where: { id: ticketId },
        include: {
          category: true,
          guild: true,
        },
      });

      if (!ticket) {
        console.error(`Ticket mit ID ${ticketId} nicht gefunden`);
        return false;
      }

      const guild = this.client.guilds.cache.get(ticket.guildId);
      if (!guild) {
        console.error(`Guild mit ID ${ticket.guildId} nicht gefunden`);
        return false;
      }

      // Kanal archivieren
      await this.archiveChannel(ticketId, channel);

      // Nachrichten abrufen und archivieren
      await this.archiveMessages(ticketId, channel);

      // Benutzer und Rollen archivieren
      await this.archiveUsersAndRoles(ticketId, guild, channel);

      return true;
    } catch (error) {
      console.error('Fehler beim Archivieren des Tickets:', error);
      return false;
    }
  }

  /**
   * Archiviert die Kanalinformationen
   */
  private async archiveChannel(ticketId: string, channel: TextChannel): Promise<void> {
    await prismaClient.archivedChannel.create({
      data: {
        ticketId,
        channelId: channel.id,
        name: channel.name,
      },
    });
  }

  /**
   * Archiviert alle Nachrichten des Ticket-Kanals
   */
  private async archiveMessages(ticketId: string, channel: TextChannel): Promise<void> {
    let lastMessageId: string | undefined;
    const batchSize = 100;
    let messageCount = 0;

    while (true) {
      const options: { limit: number; before?: string } = { limit: batchSize };
      if (lastMessageId) options.before = lastMessageId;

      const messages = await channel.messages.fetch(options);
      if (messages.size === 0) break;

      for (const [, message] of messages) {
        lastMessageId = message.id;

        // Nachrichtenverfasser archivieren
        const userExists = await prismaClient.archivedUser.findUnique({
          where: {
            ticketId_userId: {
              ticketId,
              userId: message.author.id,
            },
          },
        });

        if (!userExists) {
          await prismaClient.archivedUser.create({
            data: {
              ticketId,
              userId: message.author.id,
              username: message.author.username,
              discriminator: message.author.discriminator,
              avatar: message.author.avatar,
              bot: message.author.bot,
              displayName: message.member?.displayName || message.author.username,
            },
          });
        }

        // Nachricht archivieren
        await prismaClient.archivedMessage.create({
          data: {
            id: message.id,
            ticketId,
            authorId: message.author.id,
            content: message.content || '',
            createdAt: message.createdAt,
            edited: message.editedAt !== null,
            deleted: false,
            external: false,
          },
        });

        messageCount++;
      }

      // Bei Erreichen des Batch-Limits fortsetzen, sonst abbrechen
      if (messages.size < batchSize) break;
    }

    // Ticket mit der Anzahl der archivierten Nachrichten aktualisieren
    await prismaClient.ticket.update({
      where: { id: ticketId },
      data: { messageCount },
    });
  }

  /**
   * Archiviert alle Benutzer und Rollen im Ticket-Kanal
   */
  private async archiveUsersAndRoles(ticketId: string, guild: Guild, channel: TextChannel): Promise<void> {
    // Alle Rollen im Server erfassen
    for (const [roleId, role] of guild.roles.cache) {
      // Standard-Rolle @everyone überspringen
      if (roleId === guild.id) continue;

      const colorHex = role.color.toString(16).padStart(6, '0');
      
      await prismaClient.archivedRole.create({
        data: {
          ticketId,
          roleId,
          name: role.name,
          colour: colorHex,
        },
      });
    }

    // Alle Benutzer erfassen, die auf den Kanal zugreifen können
    const permissionOverwrites = channel.permissionOverwrites.cache;
    for (const [id, overwrite] of permissionOverwrites) {
      // Rollen überspringen
      if (overwrite.type === 0) continue;

      // Benutzer abrufen
      try {
        const user = await this.client.users.fetch(id);
        const member = await guild.members.fetch(id);

        // Benutzer archivieren, falls noch nicht geschehen
        const userExists = await prismaClient.archivedUser.findUnique({
          where: {
            ticketId_userId: {
              ticketId,
              userId: user.id,
            },
          },
        });

        if (!userExists) {
          // Hauptrolle des Benutzers ermitteln
          let primaryRoleId: string | null = null;
          
          if (member) {
            const highestRole = member.roles.highest;
            if (highestRole && highestRole.id !== guild.id) {
              primaryRoleId = highestRole.id;
            }
          }

          await prismaClient.archivedUser.create({
            data: {
              ticketId,
              userId: user.id,
              username: user.username,
              discriminator: user.discriminator,
              avatar: user.avatar,
              bot: user.bot,
              displayName: member?.displayName || user.username,
              roleId: primaryRoleId,
            },
          });
        }
      } catch (error) {
        console.error(`Fehler beim Archivieren des Benutzers ${id}:`, error);
      }
    }
  }

  /**
   * Erstellt ein Transkript eines archivierten Tickets
   * @param ticketId ID des archivierten Tickets
   */
  async generateTranscript(ticketId: string): Promise<string> {
    // Ticket-Daten abrufen
    const ticket = await prismaClient.ticket.findUnique({
      where: { id: ticketId },
      include: {
        archivedMessages: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        archivedUsers: {
          include: {
            role: true,
          },
        },
        archivedChannels: true,
        category: true,
        createdBy: true,
        closedBy: true,
      },
    });

    if (!ticket) {
      throw new Error(`Ticket mit ID ${ticketId} nicht gefunden`);
    }

    // Einfaches HTML-Transkript erstellen
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket #${ticket.number} - ${ticket.topic || 'Kein Thema'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .ticket-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .messages { border: 1px solid #eee; border-radius: 5px; }
        .message { padding: 10px; border-bottom: 1px solid #eee; }
        .message:last-child { border-bottom: none; }
        .message .author { font-weight: bold; margin-bottom: 5px; }
        .message .content { margin-left: 10px; }
        .message .timestamp { color: #999; font-size: 0.8em; }
        .bot { background-color: #f0f8ff; }
        .system { background-color: #fff8dc; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="ticket-info">
        <h1>Ticket #${ticket.number}</h1>
        <p><strong>Kategorie:</strong> ${ticket.category?.name || 'Unbekannt'}</p>
        <p><strong>Erstellt von:</strong> ${ticket.createdBy?.username || 'Unbekannt'}</p>
        <p><strong>Erstellt am:</strong> ${ticket.createdAt.toLocaleString()}</p>
        <p><strong>Thema:</strong> ${ticket.topic || 'Kein Thema'}</p>
        ${ticket.closedAt ? `<p><strong>Geschlossen am:</strong> ${ticket.closedAt.toLocaleString()}</p>` : ''}
        ${ticket.closedBy ? `<p><strong>Geschlossen von:</strong> ${ticket.closedBy.username}</p>` : ''}
        ${ticket.closedReason ? `<p><strong>Schließungsgrund:</strong> ${ticket.closedReason}</p>` : ''}
      </div>
      
      <h2>Nachrichten</h2>
      <div class="messages">
    `;

    for (const message of ticket.archivedMessages) {
      const isBot = message.author.bot;
      const timestamp = new Date(message.createdAt).toLocaleString();
      
      html += `
        <div class="message ${isBot ? 'bot' : ''}">
          <div class="author">${message.author.username}${isBot ? ' [BOT]' : ''}</div>
          <div class="content">${this.escapeHtml(message.content)}</div>
          <div class="timestamp">${timestamp}</div>
        </div>
      `;
    }

    html += `
      </div>
    </body>
    </html>
    `;

    return html;
  }

  /**
   * Hilfsfunktion zum Escapen von HTML
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }
}
