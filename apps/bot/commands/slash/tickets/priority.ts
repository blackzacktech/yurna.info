import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: {
    name: 'ticket-priority',
    description: 'Ändert die Priorität eines Tickets'
  },
  
  name: "ticket-priority",
  description: " Ändert die Priorität eines Tickets",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-priority [priority]",
  options: [
    {
      name: 'priority',
      description: 'Die neue Priorität für das Ticket',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Niedrig', value: 'LOW' },
        { name: 'Mittel', value: 'MEDIUM' },
        { name: 'Hoch', value: 'HIGH' },
        { name: 'Kritisch', value: 'CRITICAL' }
      ]
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

    // Neue Priorität abrufen
    const newPriority = interaction.options.getString('priority');
    if (!newPriority) {
      await interaction.reply({
        content: 'Du musst eine gültige Priorität angeben.',
        ephemeral: true
      });
      return;
    }

    try {
      // Priorität im Ticket aktualisieren
      await ticketManager.updateTicket(ticketId, { priority: newPriority });

      const priorityLabels: Record<string, string> = {
        LOW: 'Niedrig',
        MEDIUM: 'Mittel',
        HIGH: 'Hoch',
        CRITICAL: 'Kritisch'
      };

      await interaction.reply({
        content: `Die Priorität des Tickets wurde auf **${priorityLabels[newPriority]}** gesetzt.`
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
