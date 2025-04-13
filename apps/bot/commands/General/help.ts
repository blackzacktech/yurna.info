import { formatDuration } from "@yurna/util/functions/util";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
  codeBlock,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord.js";
import type { SlashCommand } from "@/util/types/Command";

interface Category {
  name: string;
  emoji: string;
}

function getCategoryEmoji(category: string | undefined, emojis: Category[]): string {
  const found = emojis.find((cat) => cat.name === category?.toLowerCase());
  return found?.emoji ?? "❔";
}

export default {
  name: "help",
  description: "❔ Display a list of all available commands",
  type: ApplicationCommandType.ChatInput,
  cooldown: 5000,
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  usage: "/help [command]",
  options: [
    {
      name: "query",
      description: "The full name of command or category",
      autocomplete: true,
      type: ApplicationCommandOptionType.String,
      max_length: 256,
      required: false,
    },
  ],
  autocomplete: async (client, interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "query") {
      const commands = focusedOption.value
        ? Array.from(client.slashCommands.filter((cmd) => cmd.name.toLowerCase().includes(focusedOption.value.toLowerCase())).values())
        : Array.from(client.slashCommands.values());

      await interaction.respond(
        commands.slice(0, 25).map((choice) => ({
          name: `/${choice.name} - ${choice.description}`,
          value: choice.name,
        }))
      );
    }
  },
  run: async (client, interaction, guildSettings) => {
    try {
      if (!client.user) return client.errorMessages.createSlashError(interaction, "❌ Bot is not ready yet. Please try again later.");

      const globalActionRow: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
      const inviteLink = `https://discord.com/oauth2/authorize/?permissions=${client.config.permissions}&scope=${client.config.scopes}&client_id=${client.user.id}`;

      if (client.config.url) {
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Dashboard").setURL(client.config.url),
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Invite").setURL(inviteLink),
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("All Commands").setURL(`${client.config.url}/commands`)
        );
        globalActionRow.push(buttonRow);
      }

      const query = interaction.options.getString("query") || "";
      const emojis = client.config.emojis.categories as Category[];
      const isCategory = client.slashCommands.map((cmd) => cmd.category?.toLowerCase()).includes(query?.toLowerCase());

      if (query && !isCategory) {
        const command = client.slashCommands.get(query.toLowerCase());
        if (!command) {
          return client.errorMessages.createSlashError(interaction, `❌ The command \`${query}\` does not exist. Please check your spelling and try again.`);
        }

        const embed = new EmbedBuilder()
          .setTitle(`❔ Help for /${command.name}`)
          .addFields([
            { name: "Name", value: codeBlock(command.name), inline: true },
            { name: "Usage", value: codeBlock(command.usage), inline: true },
            { name: "Description", value: codeBlock(command.description) },
            { name: "Cooldown", value: codeBlock(formatDuration(command.cooldown || 0)), inline: true },
            { name: "Category", value: codeBlock(command.category || "General"), inline: true },
          ])
          .setColor(guildSettings?.embedColor || client.config.defaultColor)
          .setTimestamp()
          .setFooter({
            text: `Requested by ${interaction.user.globalName || interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ size: 256 }),
          });

        return interaction.followUp({ ephemeral: false, embeds: [embed], components: globalActionRow });
      } else if (query && isCategory) {
        const commands = client.slashCommands.filter((cmd) => cmd.category?.toLowerCase() === query.toLowerCase());

        const emoji = getCategoryEmoji(query, emojis);
        const embed = new EmbedBuilder()
          .setTitle(`${emoji} Available \`${query}\` commands \`(${commands.size})\``)
          .setDescription(`> ${commands.map((cmd) => `\`/${cmd.name}\``).join(", ")}`)
          .setColor(guildSettings?.embedColor || client.config.defaultColor)
          .setTimestamp()
          .setFooter({
            text: `Requested by ${interaction.user.globalName || interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ size: 256 }),
          });

        return interaction.followUp({ ephemeral: false, embeds: [embed], components: globalActionRow });
      } else {
        const categories = [...new Set(client.slashCommands.map((cmd) => cmd.category))];

        const embed = new EmbedBuilder()
          .setTitle("❔ Help")
          .setDescription(`> Use the menu, or use [\`/help [category]\`](${inviteLink}) to view commands based on their category!`)
          .addFields(
            categories
              .map((category) => ({
                name: `${getCategoryEmoji(category, emojis)} ${category ?? "General"}`,
                value: codeBlock(`/help ${category?.toLowerCase()}`),
                inline: `/help ${category?.toLowerCase()}`.length < 15,
              }))
              .sort((a, b) => (a.inline === b.inline ? a.name.length - b.name.length : a.inline ? -1 : 1))
          )
          .setColor(guildSettings?.embedColor || client.config.defaultColor)
          .setTimestamp()
          .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
          .setAuthor({
            name: `${client.user.username} Help`,
            iconURL: client.user.displayAvatarURL({ size: 256 }),
          })
          .setFooter({
            text: `Requested by ${interaction.user.globalName || interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ size: 256 }),
          });

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("help_select")
            .setPlaceholder("Select a category")
            .addOptions(
              categories.map((category) => ({
                label: `${getCategoryEmoji(category, emojis)} ${category ?? "General"}`,
                description: `View all ${client.slashCommands.filter((cmd) => cmd.category?.toLowerCase() === category?.toLowerCase()).size} commands`,
                value: category?.toLowerCase() ?? "",
              }))
            )
        );

        const actionRow = [selectRow, ...globalActionRow];
        const response = await interaction.followUp({ ephemeral: false, embeds: [embed], components: actionRow });

        const collector = response.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id,
          time: 3 * 60 * 1000,
        });

        collector.on("collect", async (i) => {
          const selectedCategory = i.values[0];
          const commands = client.slashCommands.filter((cmd) => cmd.category?.toLowerCase() === selectedCategory);

          const emoji = getCategoryEmoji(selectedCategory, emojis);
          const embed = new EmbedBuilder()
            .setTitle(`${emoji} Available \`${selectedCategory}\` commands \`(${commands.size})\``)
            .setDescription(`> ${commands.map((cmd) => `\`/${cmd.name}\``).join(", ")}`)
            .setColor(guildSettings?.embedColor || client.config.defaultColor)
            .setTimestamp()
            .setFooter({
              text: `Requested by ${interaction.user.globalName || interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL({ size: 256 }),
            });

          try {
            await i.update({ embeds: [embed], components: actionRow });
          } catch {
            return;
          }
        });

        collector.on("end", async () => {
          try {
            await interaction.editReply({ embeds: [embed], components: globalActionRow });
          } catch {
            return;
          }
        });

        return;
      }
    } catch (err) {
      client.errorMessages.internalError(interaction, err);
    }
  },
} satisfies SlashCommand;
