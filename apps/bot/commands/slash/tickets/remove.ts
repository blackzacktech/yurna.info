import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@yurna/types';

const command: Command = {
  name: 'ticket-remove',
  description: 'Entfernt einen Benutzer aus einem Ticket',
  options: [
    {
      name: 'user',
      description: 'Der Benutzer, der aus dem Ticket entfernt werden soll',
      type: ApplicationCommandOptionType.User,
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
    if (!ticket) {
      await interaction.reply({
        content: 'Dieses Ticket konnte nicht gefunden werden.',
        ephemeral: true
      });
      return;
    }

    // Zu entfernenden Benutzer abrufen
    const user = interaction.options.getUser('user');
    if (!user) {
      await interaction.reply({
        content: 'Der angegebene Benutzer wurde nicht gefunden.',
        ephemeral: true
      });
      return;
    }

    // Prüfen, ob der Benutzer der Ticket-Ersteller ist
    if (user.id === ticket.createdById) {
      await interaction.reply({
        content: 'Der Ticket-Ersteller kann nicht aus dem Ticket entfernt werden.',
        ephemeral: true
      });
      return;
    }

    // Member vom Server abrufen
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: 'Der angegebene Benutzer ist nicht auf diesem Server.',
        ephemeral: true
      });
      return;
    }

    // Kanal-Berechtigungen aktualisieren
    try {
      await channel.permissionOverwrites.delete(member);

      await interaction.reply({
        content: `${member} wurde aus dem Ticket entfernt.`
      });
    } catch (error) {
      console.error('Fehler beim Entfernen aus dem Ticket:', error);
      await interaction.reply({
        content: 'Beim Entfernen des Benutzers ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};

export default command;
