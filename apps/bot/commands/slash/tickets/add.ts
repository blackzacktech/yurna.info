import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '@yurna/types';

const command: Command = {
  name: 'ticket-add',
  description: 'Fügt einen Benutzer zu einem Ticket hinzu',
  options: [
    {
      name: 'user',
      description: 'Der Benutzer, der zum Ticket hinzugefügt werden soll',
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

    // Zu addierende Person abrufen
    const user = interaction.options.getUser('user');
    if (!user) {
      await interaction.reply({
        content: 'Der angegebene Benutzer wurde nicht gefunden.',
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
      await channel.permissionOverwrites.create(member, {
        ViewChannel: true,
        SendMessages: true
      });

      await interaction.reply({
        content: `${member} wurde zum Ticket hinzugefügt.`
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen zum Ticket:', error);
      await interaction.reply({
        content: 'Beim Hinzufügen des Benutzers ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};

export default command;
