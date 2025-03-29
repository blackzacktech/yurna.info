import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@yurna/types';

const command: Command = {
  name: 'ticket-transcript',
  description: 'Erstellt ein Transkript des aktuellen Tickets',
  async execute(interaction: ChatInputCommandInteraction) {
    const { client, channel } = interaction;
    if (!channel) return;

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
    if (!ticket) {
      await interaction.reply({
        content: 'Dieses Ticket konnte nicht gefunden werden.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      // Archiver aus dem Ticket-Manager verwenden
      const transcript = await ticketManager.archiver.createTranscript(channel, ticket);
      
      if (transcript && transcript.url) {
        await interaction.editReply({
          content: `Transkript erstellt: ${transcript.url}`
        });
      } else {
        await interaction.editReply({
          content: 'Das Transkript konnte nicht erstellt werden.'
        });
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Transkripts:', error);
      await interaction.editReply({
        content: 'Beim Erstellen des Transkripts ist ein Fehler aufgetreten.'
      });
    }
  }
};

export default command;
