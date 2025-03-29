import { ChatInputCommandInteraction, Client, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import prismaClient from '@yurna/database';

export default {
  data: {
    name: 'ticket-close',
    description: 'Schließt das aktuelle Ticket'
  },

  name: "ticket-close",
  description: " Schließt das aktuelle Ticket",
  type: ApplicationCommandType.ChatInput,
  cooldown: 5000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-close",

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

    // Prüfen, ob der Befehl in einem Ticket-Kanal ausgeführt wird
    if (!interaction.channel || interaction.channel.type !== 0) { // 0 = TextChannel
      await interaction.reply({
        content: 'Dieser Befehl kann nur in Ticket-Kanälen verwendet werden.',
        ephemeral: true,
      });
      return;
    }

    try {
      // Modal für den Grund des Schließens anzeigen
      const modal = new ModalBuilder()
        .setCustomId('close-ticket-modal')
        .setTitle('Ticket schließen');

      const reasonInput = new TextInputBuilder()
        .setCustomId('close-reason')
        .setLabel('Grund für das Schließen (optional)')
        .setPlaceholder('Warum wird das Ticket geschlossen?')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Fehler beim Anzeigen des Schließen-Modals:', error);
      await interaction.reply({
        content: 'Beim Schließen des Tickets ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  }
};
