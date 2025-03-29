import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@yurna/types';
import prismaClient from '@yurna/database';

const command: Command = {
  name: 'ticket-rename',
  description: 'Benennt ein Ticket-Thema um',
  options: [
    {
      name: 'topic',
      description: 'Das neue Thema des Tickets',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  async execute(interaction: ChatInputCommandInteraction) {
    const { client, channel, guild } = interaction;
    if (!channel || !guild) return;

    // Ticket-Manager aus dem Client holen
    const ticketManager = client['tickets'];
    if (!ticketManager) {
      await interaction.reply({
        content: 'Das Ticket-System ist derzeit nicht verfügbar.',
        ephemeral: true
      });
      return;
    }

    // Prüfen, ob der aktuelle Kanal ein Ticket ist
    const ticketId = await ticketManager.getTicketIdFromChannel(channel);
    if (!ticketId) {
      await interaction.reply({
        content: 'Dieser Kanal ist kein Ticket.',
        ephemeral: true
      });
      return;
    }

    // Ticket-Daten abrufen
    const ticket = await ticketManager.getTicket(ticketId, true);
    if (!ticket || !ticket.open) {
      await interaction.reply({
        content: 'Dieses Ticket existiert nicht oder ist bereits geschlossen.',
        ephemeral: true
      });
      return;
    }

    // Neues Thema abrufen
    const topic = interaction.options.getString('topic');
    if (!topic) {
      await interaction.reply({
        content: 'Bitte gib ein gültiges Thema an.',
        ephemeral: true
      });
      return;
    }

    // Ticket aktualisieren
    try {
      await prismaClient.ticket.update({
        where: { id: ticketId },
        data: { topic }
      });

      // Kanal-Thema aktualisieren
      await channel.setTopic(`${ticket.createdBy.tag}: ${topic}`);

      await interaction.reply({
        content: `Das Thema des Tickets wurde zu **${topic}** geändert.`
      });
    } catch (error) {
      console.error('Fehler beim Umbenennen des Tickets:', error);
      await interaction.reply({
        content: 'Beim Umbenennen des Tickets ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};

export default command;
