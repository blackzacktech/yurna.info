import { ChatInputCommandInteraction, Client, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: {
    name: 'ticket-claim',
    description: 'Beansprucht ein Ticket für dich'
  },
  
  name: "ticket-claim",
  description: "🎫 Beansprucht ein Ticket für dich",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-claim",

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Ticket-Manager-Instanz aus dem Client holen
    const ticketManager = client['tickets'];
    
    if (!ticketManager) {
      await interaction.reply({
        content: 'Das Ticket-System ist derzeit nicht verfügbar.',
        ephemeral: true,
      });
      return;
    }

    try {
      // Die claim-Funktion des TicketManagers aufrufen
      await ticketManager.claim(interaction);
    } catch (error) {
      console.error('Fehler beim Beanspruchen des Tickets:', error);
      await interaction.reply({
        content: 'Beim Beanspruchen des Tickets ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  }
};
