import prismaClient from "@yurna/database";
import {
  ApplicationCommandType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";
import type { SlashCommand } from "@/util/types/Command";

export default {
  name: "leaderboard-global",
  description: "🌐 Zeigt die globalen Top 10 User mit dem meisten XP & Level",
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  usage: "/leaderboard-global",
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall],

  run: async (client, interaction) => {
    try {
      const globalXP = await prismaClient.guildXp.findMany({
        orderBy: { xp: "desc" },
        take: 1000, // für global summieren
        include: {
          user: {
            select: {
              discordId: true,
              global_name: true,
              name: true,
            },
          },
          guild: {
            select: {
              guildId: true,
              vanity: true,
            },
          },
        },
      });

      // --- Top 10 nach Level (nur aus einzelnen Guild-Einträgen, wie bisher) ---
      const topLevel = globalXP
        .slice(0, 10)
        .map((entry, index) => {
          const place = index + 1;
          const emoji = place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : ` ${place} `;
          const name = entry.user.global_name || entry.user.name || `Unbekannt`;
          const server = entry.guild?.vanity || entry.guild?.guildId || "Unbekannter Server";
          const level = Math.floor(0.1 * Math.sqrt(entry.xp));
          return `**[${emoji}]** <@${entry.user.discordId}> – \`${entry.xp} XP\` – Level **${level}** – 🛡 ${server}`;
        })
        .join("\n");

      // --- Top 10 nach globaler XP summiert ---
      const totals: Record<string, { id: string, name: string, xp: number }> = {};
      for (const entry of globalXP) {
        const id = entry.user.discordId;
        const name = entry.user.global_name || entry.user.name || `Unbekannt`;
        if (!totals[id]) totals[id] = { id, name, xp: 0 };
        totals[id].xp += entry.xp;
      }

      const topGlobal = Object.values(totals)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10)
        .map((user, index) => {
          const place = index + 1;
          const emoji = place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : ` ${place} `;
          const level = Math.floor(0.1 * Math.sqrt(user.xp));
          return `**[${emoji}]** <@${user.id}> – \`${user.xp} XP\` – Level **${level}**`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🌍 Globales XP Leaderboard")
        .setColor(client.config.defaultColor)
        .setFooter({
          text: `Angefragt von ${interaction.user.globalName || interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ size: 256 }),
        })
        .setTimestamp()
        .setDescription(`**🏆 Höchstes Level (Top 10 Einzelserver):**\n${topLevel || "Keine Daten."}\n\n**📊 Meiste XP (global):**\n${topGlobal || "Keine Daten."}`);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Leaderboard Website")
          .setStyle(ButtonStyle.Link)
          .setURL(client.config.url || "https://yurna.info")
      );

      return interaction.followUp({
        embeds: [embed],
        components: [row],
      });
    } catch (err) {
      console.error("❌ Fehler beim globalen Leaderboard:", err);
      return client.errorMessages.internalError(interaction, err);
    }
  },
} satisfies SlashCommand;
