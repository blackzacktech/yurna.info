import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@yurna/types';
import { TicketPriority } from '@prisma/client';
import prismaClient from '@yurna/database';

const command: Command = {
  name: 'ticket-priority',
  description: 'Ändert die Priorität eines Tickets',
  options: [
    {
      name: 'priority',
      description: 'Die neue Priorität für das Ticket',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Niedrig', value: 'LOW' },
        { name: 'Normal', value: 'NORMAL' },
        { name: 'Hoch', value: 'HIGH' },
        { name: 'Dringend', value: 'URGENT' }
      ]
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

    // Neue Priorität abrufen
    const priority = interaction.options.getString('priority') as TicketPriority;

    // Ticket aktualisieren
    try {
      await prismaClient.ticket.update({
        where: { id: ticketId },
        data: { priority }
      });

      // Kanal-Name aktualisieren, wenn gewünscht
      // Hier könnte man z.B. ein Emoji für die Priorität hinzufügen

      // Bestätigung senden
      const priorityLabels = {
        LOW: 'Niedrig',
        NORMAL: 'Normal',
        HIGH: 'Hoch',
        URGENT: 'Dringend'
      };

      await interaction.reply({
        content: `Die Priorität dieses Tickets wurde auf **${priorityLabels[priority]}** gesetzt.`
      });
    } catch (error) {
      console.error('Fehler beim Ändern der Ticket-Priorität:', error);
      await interaction.reply({
        content: 'Beim Ändern der Priorität ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};

export default command;
