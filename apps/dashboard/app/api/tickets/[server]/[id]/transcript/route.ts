import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Transcript erstellen und herunterladen
export async function GET(
  req: NextRequest,
  { params }: { params: { server: string; id: string } }
) {
  const { server, id } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Ticket abrufen
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id,
        guildId: server,
      },
      include: {
        category: true,
        createdBy: true,
        claimedBy: true,
        closedBy: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket nicht gefunden' },
        { status: 404 }
      );
    }

    // Guild abrufen
    const guild = await prismaClient.guild.findUnique({
      where: {
        guildId: server,
      },
    });

    // Archivierte Nachrichten abrufen
    const messages = await prismaClient.archivedMessage.findMany({
      where: {
        ticketId: ticket.id,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // HTML für das Transcript erstellen
    const html = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket #${ticket.number} - Transcript</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #5865F2;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .ticket-info {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .ticket-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
          }
          .info-item {
            margin-bottom: 5px;
          }
          .info-label {
            font-weight: bold;
            color: #5865F2;
          }
          .messages {
            margin-top: 20px;
          }
          .message {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
          }
          .avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
            background-color: #5865F2;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }
          .avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }
          .username {
            font-weight: bold;
            margin-right: 8px;
          }
          .timestamp {
            color: #777;
            font-size: 0.8em;
          }
          .bot-tag {
            background-color: #5865F2;
            color: white;
            font-size: 0.7em;
            padding: 2px 5px;
            border-radius: 3px;
            margin-left: 5px;
          }
          .message-content {
            white-space: pre-wrap;
            word-break: break-word;
          }
          .attachments {
            margin-top: 5px;
          }
          .attachment {
            display: inline-block;
            margin-right: 10px;
            font-size: 0.9em;
            color: #5865F2;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ticket #${ticket.number} - Transcript</h1>
          <p>Server: ${guild?.name || server}</p>
        </div>
        
        <div class="ticket-info">
          <h2>Ticket-Details</h2>
          <div class="ticket-info-grid">
            <div class="info-item">
              <div class="info-label">Status</div>
              <div>${ticket.deleted ? 'Geschlossen' : 'Offen'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Kategorie</div>
              <div>${ticket.category ? `${ticket.category.emoji} ${ticket.category.name}` : 'Keine Kategorie'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Erstellt von</div>
              <div>${ticket.createdBy.username}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Erstellt am</div>
              <div>${format(new Date(ticket.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })}</div>
            </div>
            ${ticket.claimedById ? `
            <div class="info-item">
              <div class="info-label">Beansprucht von</div>
              <div>${ticket.claimedBy?.username || 'Unbekannt'}</div>
            </div>
            ` : ''}
            ${ticket.closedById && ticket.closedAt ? `
            <div class="info-item">
              <div class="info-label">Geschlossen von</div>
              <div>${ticket.closedBy?.username || 'Unbekannt'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Geschlossen am</div>
              <div>${format(new Date(ticket.closedAt), 'dd. MMMM yyyy, HH:mm', { locale: de })}</div>
            </div>
            ` : ''}
            ${ticket.topic ? `
            <div class="info-item">
              <div class="info-label">Thema</div>
              <div>${ticket.topic}</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="messages">
          <h2>Nachrichten</h2>
          ${messages.length === 0 ? `
          <p>Keine Nachrichten gefunden.</p>
          ` : messages.map(message => `
          <div class="message">
            <div class="message-header">
              <div class="avatar">
                ${message.author.avatarUrl ? `
                <img src="${message.author.avatarUrl}" alt="${message.author.username}" />
                ` : message.author.username.substring(0, 2).toUpperCase()}
              </div>
              <div class="username">${message.author.username}</div>
              <div class="timestamp">${format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</div>
              ${message.author.isBot ? '<span class="bot-tag">BOT</span>' : ''}
            </div>
            <div class="message-content">${message.content}</div>
            ${message.attachments && message.attachments.length > 0 ? `
            <div class="attachments">
              ${message.attachments.map((attachment, index) => `
              <a href="${attachment.url}" target="_blank" class="attachment">${attachment.name || `Anhang ${index + 1}`}</a>
              `).join('')}
            </div>
            ` : ''}
          </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>Dieses Transcript wurde am ${format(new Date(), 'dd. MMMM yyyy, HH:mm', { locale: de })} erstellt.</p>
          <p>Ticket-ID: ${ticket.id}</p>
        </div>
      </body>
      </html>
    `;

    // Transcript als HTML-Datei zurückgeben
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="ticket-${ticket.number}-transcript.html"`,
      },
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Transcripts:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Transcripts' },
      { status: 500 }
    );
  }
}
