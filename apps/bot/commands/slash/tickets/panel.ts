import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '@yurna/types';
import prismaClient from '@yurna/database';

const command: Command = {
  name: 'ticket-panel',
  description: 'Erstellt ein Ticket-Panel zum Öffnen neuer Tickets',
  options: [
    {
      name: 'title',
      description: 'Der Titel des Panels',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'description',
      description: 'Die Beschreibung des Panels',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'category',
      description: 'Die ID der Ticket-Kategorie (optional, zeigt sonst alle Kategorien an)',
      type: ApplicationCommandOptionType.Integer,
      required: false
    },
    {
      name: 'color',
      description: 'Die Farbe des Panels als Hex-Code (z.B. #7289DA)',
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],
  async execute(interaction: ChatInputCommandInteraction) {
    const { guild } = interaction;
    if (!guild) return;

    // Serveradministrator-Berechtigungen prüfen
    if (!interaction.memberPermissions?.has('Administrator')) {
      await interaction.reply({
        content: 'Du benötigst Administrator-Berechtigungen, um Ticket-Panels zu erstellen.',
        ephemeral: true
      });
      return;
    }

    // Panel-Daten aus den Optionen abrufen
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const categoryId = interaction.options.getInteger('category');
    const colorString = interaction.options.getString('color') || '#7289DA';
    
    // Farbe parsen
    let color;
    try {
      color = parseInt(colorString.replace('#', ''), 16);
    } catch {
      color = 0x7289DA; // Discord-Blau als Fallback
    }

    // Wenn eine spezifische Kategorie angegeben wurde, diese abrufen
    if (categoryId) {
      const category = await prismaClient.ticketCategory.findUnique({
        where: { 
          id: categoryId,
          guildId: guild.id
        }
      });

      if (!category) {
        await interaction.reply({
          content: `Die Ticket-Kategorie mit der ID ${categoryId} existiert nicht.`,
          ephemeral: true
        });
        return;
      }

      // Panel mit nur einem Button für diese Kategorie erstellen
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Ticket-Kategorie: ${category.name}` });

      const button = new ButtonBuilder()
        .setCustomId(`ticket:create:${category.id}`)
        .setLabel(`Ticket in ${category.name} erstellen`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      await interaction.reply({
        content: 'Ticket-Panel wird erstellt...',
        ephemeral: true
      });

      await interaction.channel?.send({
        embeds: [embed],
        components: [row]
      });
    } else {
      // Alle aktiven Kategorien für diese Guild abrufen
      const categories = await prismaClient.ticketCategory.findMany({
        where: {
          guildId: guild.id,
          active: true
        },
        orderBy: {
          name: 'asc'
        },
        take: 5 // Maximal 5 Kategorien, da Discord maximal 5 Buttons pro Zeile erlaubt
      });

      if (categories.length === 0) {
        await interaction.reply({
          content: 'Es sind keine aktiven Ticket-Kategorien vorhanden. Erstelle zuerst Kategorien über das Dashboard.',
          ephemeral: true
        });
        return;
      }

      // Panel mit Buttons für alle Kategorien erstellen
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: `Verfügbare Kategorien: ${categories.map(c => c.name).join(', ')}` });

      const row = new ActionRowBuilder<ButtonBuilder>();

      for (const category of categories) {
        const button = new ButtonBuilder()
          .setCustomId(`ticket:create:${category.id}`)
          .setLabel(category.name)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫');

        row.addComponents(button);
      }

      await interaction.reply({
        content: 'Ticket-Panel wird erstellt...',
        ephemeral: true
      });

      await interaction.channel?.send({
        embeds: [embed],
        components: [row]
      });
    }
  }
};

export default command;
