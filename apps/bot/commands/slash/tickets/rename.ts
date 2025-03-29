import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: {
    name: 'ticket-rename',
    description: 'Benennt ein Ticket um'
  },
  
  name: "ticket-rename",
  description: " Benennt ein Ticket um",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-rename [name]",
  options: [
    {
      name: 'name',
      description: 'Der neue Name für das Ticket',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const { channel, guild } = interaction;
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

    // Neuen Namen abrufen
    const newName = interaction.options.getString('name');
    if (!newName) {
      await interaction.reply({
        content: 'Du musst einen gültigen Namen angeben.',
        ephemeral: true
      });
      return;
    }

    try {
      // Ticket umbenennen
      await ticketManager.updateTicket(ticketId, { topic: newName });
      
      // Optional: Auch den Kanal umbenennen
      try {
        if (channel.isTextBased() && 'setName' in channel) {
          // Ticket-Nummer beibehalten, wenn vorhanden
          const currentName = channel.name;
          const ticketNumberMatch = currentName.match(/^ticket-(\d+)/i);
          
          if (ticketNumberMatch) {
            const ticketNumber = ticketNumberMatch[1];
            const sanitizedName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 90);
            await channel.setName(`ticket-${ticketNumber}-${sanitizedName}`);
          } else {
            const sanitizedName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 95);
            await channel.setName(`ticket-${sanitizedName}`);
          }
        }
      } catch (err) {
        console.error('Fehler beim Umbenennen des Kanals:', err);
        // Wir ignorieren Fehler beim Umbenennen des Kanals, 
        // da das Ticket selbst bereits umbenannt wurde
      }

      await interaction.reply({
        content: `Das Ticket wurde zu **${newName}** umbenannt.`
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
