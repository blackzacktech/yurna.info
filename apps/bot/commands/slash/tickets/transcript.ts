import { ChatInputCommandInteraction, Client, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: {
    name: 'ticket-transcript',
    description: 'Erstellt ein Transcript des aktuellen Tickets'
  },
  
  name: "ticket-transcript",
  description: "🎫 Erstellt ein Transcript des aktuellen Tickets",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-transcript",

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

    try {
      // Anfrage für einen Transcript
      await interaction.deferReply();
      
      // Transcript erstellen
      const transcriptUrl = await ticketManager.createTranscript(channel, ticketId);
      
      if (!transcriptUrl) {
        await interaction.editReply({
          content: 'Es konnte kein Transcript erstellt werden.'
        });
        return;
      }
      
      await interaction.editReply({
        content: `Transcript wurde erstellt: ${transcriptUrl}`
      });
    } catch (error) {
      console.error('Fehler beim Erstellen des Transcripts:', error);
      await interaction.reply({
        content: 'Beim Erstellen des Transcripts ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};
