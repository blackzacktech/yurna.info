import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, ChannelType } from 'discord.js';

export default {
  data: {
    name: 'ticket-panel',
    description: 'Erstellt ein Ticket-Panel in einem Kanal'
  },
  
  name: "ticket-panel",
  description: " Erstellt ein Ticket-Panel in einem Kanal",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/ticket-panel [category] [channel]",
  options: [
    {
      name: 'category',
      description: 'Die Ticket-Kategorie, für die ein Panel erstellt werden soll',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'channel',
      description: 'Der Kanal, in dem das Panel erstellt werden soll (Standard: aktueller Kanal)',
      type: ApplicationCommandOptionType.Channel,
      required: false,
      channelTypes: [ChannelType.GuildText]
    }
  ],

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const { guild } = interaction;
    if (!guild) return;

    // Ticket-Manager aus dem Client holen
    const ticketManager = client['tickets'];
    if (!ticketManager) {
      await interaction.reply({
        content: 'Das Ticket-System ist derzeit nicht verfügbar.',
        ephemeral: true
      });
      return;
    }

    // Kategorie-ID oder -Name abrufen
    const categoryIdOrName = interaction.options.getString('category');
    if (!categoryIdOrName) {
      await interaction.reply({
        content: 'Du musst eine gültige Kategorie angeben.',
        ephemeral: true
      });
      return;
    }

    // Zielkanal bestimmen (aktueller Kanal, wenn nicht angegeben)
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    if (!targetChannel || !targetChannel.isTextBased() || targetChannel.isDMBased()) {
      await interaction.reply({
        content: 'Der angegebene Kanal ist kein gültiger Textkanal.',
        ephemeral: true
      });
      return;
    }

    try {
      // Panel erstellen
      await interaction.deferReply({ ephemeral: true });
      
      // Kategorie abrufen (ob es sich um eine ID oder einen Namen handelt)
      const category = await ticketManager.getCategory(guild.id, categoryIdOrName);
      
      if (!category) {
        await interaction.editReply({
          content: `Die Kategorie "${categoryIdOrName}" wurde nicht gefunden.`
        });
        return;
      }
      
      // Panel erstellen
      const success = await ticketManager.createPanel(targetChannel, category.id);
      
      if (success) {
        await interaction.editReply({
          content: `Ticket-Panel für Kategorie "${category.name}" wurde in <#${targetChannel.id}> erstellt.`
        });
      } else {
        await interaction.editReply({
          content: 'Es gab ein Problem beim Erstellen des Ticket-Panels.'
        });
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Ticket-Panels:', error);
      await interaction.editReply({
        content: 'Beim Erstellen des Ticket-Panels ist ein Fehler aufgetreten.'
      });
    }
  }
};
