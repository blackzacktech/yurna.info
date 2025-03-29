import { ButtonInteraction, ChatInputCommandInteraction, Collection, Guild, GuildMember, TextChannel, User } from 'discord.js';
import prismaClient from '@yurna/database';
import { TicketPriority } from '@prisma/client';
import { TicketArchiver } from './TicketArchiver';

export class TicketManager {
  private readonly archiver: TicketArchiver;
  private readonly client: any; // Anpassen an deinen Client-Typ
  private readonly ticketCountCache: { [categoryId: string]: number } = {};
  private readonly memberTicketCountCache: { [categoryId: string]: { [memberId: string]: number } } = {};
  private readonly cooldownCache: { [categoryId: string]: { [memberId: string]: number } } = {};
  private readonly numberCache: { [guildId: string]: number } = {};
  private readonly staleTickets: Collection<string, number> = new Collection();

  constructor(client: any) {
    this.client = client;
    this.archiver = new TicketArchiver(client);
  }

  /**
   * Holt die Kategorie-Daten aus der Datenbank
   * @param categoryId ID der Ticket-Kategorie
   * @param force Cache umgehen und aktualisieren?
   */
  async getCategory(categoryId: number, force = false) {
    const cachedCategory = this.client.categories?.get(categoryId);
    if (cachedCategory && !force) return cachedCategory;

    const category = await prismaClient.ticketCategory.findUnique({
      where: { id: categoryId },
      include: {
        guild: true,
        questions: true,
      },
    });

    if (category) {
      this.client.categories?.set(categoryId, category);
    }

    return category;
  }

  /**
   * Holt die Ticket-Daten aus der Datenbank
   * @param ticketId ID des Tickets
   * @param force Cache umgehen und aktualisieren?
   */
  async getTicket(ticketId: string, force = false) {
    const cachedTicket = this.client.tickets?.get(ticketId);
    if (cachedTicket && !force) return cachedTicket;

    const ticket = await prismaClient.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: true,
        feedback: true,
        guild: true,
      },
    });

    if (ticket) {
      this.client.tickets?.set(ticketId, ticket);
    }

    return ticket;
  }

  /**
   * Ermittelt die Gesamtzahl der Tickets in einer Kategorie
   * @param categoryId ID der Kategorie
   */
  async getTotalCount(categoryId: number): Promise<number> {
    if (this.ticketCountCache[categoryId]) return this.ticketCountCache[categoryId];

    const count = await prismaClient.ticket.count({
      where: {
        categoryId,
        open: true,
        deleted: false,
      },
    });

    this.ticketCountCache[categoryId] = count;
    return count;
  }

  /**
   * Ermittelt die Anzahl der Tickets eines Mitglieds in einer Kategorie
   * @param categoryId ID der Kategorie
   * @param memberId ID des Mitglieds
   */
  async getMemberCount(categoryId: number, memberId: string): Promise<number> {
    if (this.memberTicketCountCache[categoryId]?.[memberId]) 
      return this.memberTicketCountCache[categoryId][memberId];

    const count = await prismaClient.ticket.count({
      where: {
        categoryId,
        createdById: memberId,
        open: true,
        deleted: false,
      },
    });

    if (!this.memberTicketCountCache[categoryId]) 
      this.memberTicketCountCache[categoryId] = {};
    
    this.memberTicketCountCache[categoryId][memberId] = count;
    return count;
  }

  /**
   * Prüft, ob ein Mitglied noch im Cooldown für eine Kategorie ist
   * @param categoryId ID der Kategorie
   * @param memberId ID des Mitglieds
   */
  getCooldown(categoryId: number, memberId: string): number {
    return this.cooldownCache[categoryId]?.[memberId] || 0;
  }

  /**
   * Ermittelt die nächste Ticketnummer für eine Guild
   * @param guildId ID der Guild
   */
  async getNextNumber(guildId: string): Promise<number> {
    if (this.numberCache[guildId]) {
      this.numberCache[guildId]++;
      return this.numberCache[guildId];
    }

    const highestTicket = await prismaClient.ticket.findFirst({
      where: { guildId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const nextNumber = (highestTicket?.number || 0) + 1;
    this.numberCache[guildId] = nextNumber;
    
    return nextNumber;
  }

  /**
   * Erstellt ein neues Ticket
   * @param options Ticket-Erstellungsoptionen
   */
  async create(options: {
    categoryId: number;
    interaction: ChatInputCommandInteraction | ButtonInteraction;
    topic?: string;
    referencesTicketId?: string;
    referencesMessageId?: string;
  }) {
    const { categoryId, interaction, topic, referencesTicketId, referencesMessageId } = options;
    
    // Kategorie abrufen
    const category = await this.getCategory(categoryId);
    if (!category) {
      await interaction.reply({
        content: 'Die ausgewählte Ticket-Kategorie existiert nicht mehr.',
        ephemeral: true,
      });
      return;
    }

    // Berechtigungen prüfen
    const member = interaction.member as GuildMember;
    const requiredRoles = category.requiredRoles as string[];
    
    if (requiredRoles.length > 0 && !member.roles.cache.some(role => requiredRoles.includes(role.id))) {
      await interaction.reply({
        content: 'Du hast keine Berechtigung, in dieser Kategorie ein Ticket zu erstellen.',
        ephemeral: true,
      });
      return;
    }
    
    // Grenzwert für die Gesamtzahl der Tickets prüfen
    const totalCount = await this.getTotalCount(categoryId);
    if (totalCount >= category.totalLimit) {
      await interaction.reply({
        content: `In dieser Kategorie können maximal ${category.totalLimit} Tickets gleichzeitig geöffnet sein.`,
        ephemeral: true,
      });
      return;
    }
    
    // Grenzwert für die Anzahl der Tickets pro Mitglied prüfen
    const memberCount = await this.getMemberCount(categoryId, member.id);
    if (memberCount >= category.memberLimit) {
      await interaction.reply({
        content: `Du kannst maximal ${category.memberLimit} Ticket(s) in dieser Kategorie gleichzeitig geöffnet haben.`,
        ephemeral: true,
      });
      return;
    }
    
    // Cooldown prüfen
    const cooldownEnd = this.getCooldown(categoryId, member.id);
    if (cooldownEnd > Date.now()) {
      const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
      await interaction.reply({
        content: `Du musst noch ${remainingTime} Sekunden warten, bevor du ein neues Ticket erstellen kannst.`,
        ephemeral: true,
      });
      return;
    }

    // Wenn Fragen konfiguriert sind, diese stellen
    if (category.questions.length > 0) {
      await this.postQuestions({
        categoryId,
        interaction,
        topic,
        referencesMessageId,
        referencesTicketId,
      });
      return;
    }

    // Ansonsten direkt ein Ticket erstellen
    await this.createTicket({
      categoryId,
      createdBy: member.user,
      guild: interaction.guild as Guild,
      topic,
      referencesTicketId,
      referencesMessageId,
    });

    await interaction.reply({
      content: 'Dein Ticket wurde erstellt!',
      ephemeral: true,
    });
  }
  
  /**
   * Stellt Fragen für die Ticket-Erstellung
   */
  async postQuestions(options: {
    categoryId: number;
    interaction: ChatInputCommandInteraction | ButtonInteraction;
    topic?: string;
    referencesTicketId?: string;
    referencesMessageId?: string;
  }) {
    // Implementierung der Fragenlogik...
    // Hier würden wir die Modal-Dialoge oder Select-Menüs für die Fragen erstellen
    // Dies wäre eine umfangreiche Funktion, die wir später implementieren
  }

  /**
   * Erstellt tatsächlich das Ticket in der Datenbank und den Discord-Kanal
   */
  async createTicket(options: {
    categoryId: number;
    createdBy: User;
    guild: Guild;
    topic?: string;
    referencesTicketId?: string;
    referencesMessageId?: string;
    answers?: Array<{ questionId: string; value: string }>;
  }) {
    const { categoryId, createdBy, guild, topic, referencesTicketId, referencesMessageId, answers } = options;
    
    // Kategorie abrufen
    const category = await this.getCategory(categoryId);
    if (!category) return null;

    // Neue Ticket-Nummer generieren
    const number = await this.getNextNumber(guild.id);
    
    // Discord-Kategorie für das Ticket
    const discordCategory = guild.channels.cache.get(category.discordCategory);
    if (!discordCategory || !discordCategory.isCategory()) {
      console.error(`Discord category ${category.discordCategory} not found for ticket category ${categoryId}`);
      return null;
    }
    
    // Ticket in der Datenbank erstellen
    const ticket = await prismaClient.ticket.create({
      data: {
        id: `${guild.id}-${number}`,
        number,
        open: true,
        guildId: guild.id,
        categoryId,
        createdById: createdBy.id,
        topic: topic || null,
        referencesTicketId: referencesTicketId || null,
        referencesMessageId: referencesMessageId || null,
        openingMessageId: '0', // Wird später aktualisiert
      },
    });
    
    // Wenn Antworten auf Fragen vorliegen, diese speichern
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        await prismaClient.ticketQuestionAnswer.create({
          data: {
            ticketId: ticket.id,
            questionId: answer.questionId,
            userId: createdBy.id,
            value: answer.value,
          },
        });
      }
    }

    // Discord-Kanal für das Ticket erstellen
    try {
      const channelName = category.channelName
        .replace('{id}', number.toString())
        .replace('{username}', createdBy.username.replace(/[^a-z0-9]/gi, '-').toLowerCase());
        
      const channel = await guild.channels.create({
        name: channelName,
        type: 0, // TextChannel
        parent: discordCategory.id,
        topic: topic ? `${createdBy.tag}: ${topic}` : createdBy.tag,
      });
      
      // Berechtigungen für den Kanal setzen
      await channel.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
      await channel.permissionOverwrites.create(createdBy.id, { ViewChannel: true, SendMessages: true });
      
      // Staff-Rollen Berechtigungen geben
      const staffRoles = category.staffRoles as string[];
      for (const roleId of staffRoles) {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          await channel.permissionOverwrites.create(role, { ViewChannel: true, SendMessages: true });
        }
      }
      
      // Eröffnungsnachricht senden
      const openingMessage = await (channel as TextChannel).send({
        content: `<@${createdBy.id}> ${category.openingMessage}`,
        // Hier würden wir Buttons für Claim, Close, etc. hinzufügen
      });
      
      // Ticket aktualisieren mit der ID der Eröffnungsnachricht
      await prismaClient.ticket.update({
        where: { id: ticket.id },
        data: { openingMessageId: openingMessage.id },
      });
      
      return { ticket, channel };
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      await prismaClient.ticket.delete({ where: { id: ticket.id } });
      return null;
    }
  }

  /**
   * Beansprucht ein Ticket
   * @param interaction Die Interaktion, die die Beanspruchung ausgelöst hat
   */
  async claim(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    // Ticket-ID aus dem Kanal ermitteln
    const channel = interaction.channel as TextChannel;
    if (!channel) return;

    const ticketId = await this.getTicketIdFromChannel(channel);
    if (!ticketId) {
      await interaction.reply({
        content: 'Dieser Kanal ist kein Ticket.',
        ephemeral: true,
      });
      return;
    }

    // Ticket abrufen
    const ticket = await this.getTicket(ticketId, true);
    if (!ticket || !ticket.open) {
      await interaction.reply({
        content: 'Dieses Ticket existiert nicht oder ist bereits geschlossen.',
        ephemeral: true,
      });
      return;
    }

    // Prüfen, ob das Ticket bereits beansprucht wurde
    if (ticket.claimedById) {
      await interaction.reply({
        content: `Dieses Ticket wurde bereits von <@${ticket.claimedById}> beansprucht.`,
        ephemeral: true,
      });
      return;
    }

    // Prüfen, ob der Nutzer ein Teammitglied ist
    const member = interaction.member as GuildMember;
    const category = ticket.category;
    const staffRoles = category.staffRoles as string[];
    
    if (!member.roles.cache.some(role => staffRoles.includes(role.id))) {
      await interaction.reply({
        content: 'Du hast keine Berechtigung, dieses Ticket zu beanspruchen.',
        ephemeral: true,
      });
      return;
    }

    // Ticket beanspruchen
    await prismaClient.ticket.update({
      where: { id: ticketId },
      data: { claimedById: member.id },
    });

    await interaction.reply({
      content: `${member.user.username} hat dieses Ticket beansprucht.`,
    });

    // Berechtigungen des Kanals anpassen
    if (category.claiming) {
      for (const roleId of staffRoles) {
        if (roleId === member.id) continue;
        
        const role = interaction.guild?.roles.cache.get(roleId);
        if (role) {
          await channel.permissionOverwrites.create(role, { SendMessages: false });
        }
      }
    }
  }

  /**
   * Ermittelt die Ticket-ID aus einem Kanal
   */
  private async getTicketIdFromChannel(channel: TextChannel): Promise<string | null> {
    const ticket = await prismaClient.ticket.findFirst({
      where: {
        guildId: channel.guild.id,
        open: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ticket?.id || null;
  }
}
