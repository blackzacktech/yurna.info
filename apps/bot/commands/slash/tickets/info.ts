import { ChatInputCommandInteraction, Client, EmbedBuilder, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: {
    name: 'ticket-info',
    description: 'Zeigt Informationen zum aktuellen Ticket an'
  },
  
  name: "ticket-info",
  description: " Zeigt Informationen zum aktuellen Ticket an",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-info",

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
      // Ticket-Daten abrufen
      const ticket = await ticketManager.getTicket(ticketId, true);
      
      if (!ticket) {
        await interaction.reply({
          content: 'Dieses Ticket konnte nicht gefunden werden.',
          ephemeral: true
        });
        return;
      }

      // Prioritätsname ermitteln
      const priorityLabels: Record<string, string> = {
        LOW: 'Niedrig',
        MEDIUM: 'Mittel',
        HIGH: 'Hoch',
        CRITICAL: 'Kritisch'
      };
      
      const priorityName = priorityLabels[ticket.priority] || 'Unbekannt';

      // Informationen in einem Embed anzeigen
      const embed = new EmbedBuilder()
        .setTitle(`Ticket #${ticket.number}: ${ticket.topic}`)
        .setColor(0x3498db)
        .addFields(
          { name: 'Erstellt von', value: `<@${ticket.createdById}>`, inline: true },
          { name: 'Erstellt am', value: new Date(ticket.createdAt).toLocaleString('de-DE'), inline: true },
          { name: 'Status', value: ticket.open ? ' Offen' : ' Geschlossen', inline: true },
          { name: 'Priorität', value: priorityName, inline: true },
          { name: 'Kategorie', value: ticket.category?.name || 'Keine Kategorie', inline: true }
        );

      // Zugewiesene Personen, falls vorhanden
      if (ticket.assignedTo) {
        embed.addFields({ name: 'Zugewiesen an', value: `<@${ticket.assignedTo}>`, inline: true });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Fehler beim Abrufen der Ticket-Informationen:', error);
      await interaction.reply({
        content: 'Beim Abrufen der Ticket-Informationen ist ein Fehler aufgetreten.',
        ephemeral: true
      });
    }
  }
};
