import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, ChatInputCommandInteraction, Client } from 'discord.js';
import prismaClient from '@yurna/database';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Erstellt ein neues Support-Ticket')
    .addStringOption(option =>
      option.setName('kategorie')
        .setDescription('Wähle eine Ticket-Kategorie')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option.setName('thema')
        .setDescription('Gib ein kurzes Thema für dein Ticket an')
        .setRequired(false)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const guildId = interaction.guildId;

    if (!guildId) return;

    try {
      const categories = await prismaClient.ticketCategory.findMany({
        where: {
          guildId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          emoji: true,
        },
      });

      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
        category.description.toLowerCase().includes(focusedValue.toLowerCase())
      );

      await interaction.respond(
        filtered.map(category => ({
          name: `${category.emoji} ${category.name}`,
          value: category.id.toString(),
        })).slice(0, 25)
      );
    } catch (error) {
      console.error('Fehler beim Abrufen der Ticket-Kategorien:', error);
      await interaction.respond([]);
    }
  },

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const categoryId = parseInt(interaction.options.getString('kategorie', true));
    const topic = interaction.options.getString('thema');

    try {
      // Ticket-Manager-Instanz aus dem Client holen
      const ticketManager = client['tickets'];
      
      if (!ticketManager) {
        await interaction.reply({
          content: 'Das Ticket-System ist derzeit nicht verfügbar.',
          ephemeral: true,
        });
        return;
      }

      // Ticket erstellen
      await ticketManager.create({
        categoryId,
        interaction,
        topic,
      });
    } catch (error) {
      console.error('Fehler beim Erstellen eines Tickets:', error);
      await interaction.reply({
        content: 'Beim Erstellen des Tickets ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  }
};
