import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { SlashCommand } from "@/util/types/Command";
import type { ChatInputCommandInteraction } from "discord.js";
import type { Yurnabot } from "@/index";

export default {
  name: "channel-control",
  description: "🛠️ Öffnet ein Bedienfeld für deinen Voice-Channel",
  usage: "/channel-control",
  type: ApplicationCommandType.ChatInput,
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  cooldown: 3000,
  run: async (client: Yurnabot, interaction: ChatInputCommandInteraction) => {
    const userChannel = interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel;

    const response = {
      content: "❌ Du musst in einem Voice-Channel sein, um diesen Befehl zu nutzen.",
      flags: ["Ephemeral"] as const,
    };

    if (!userChannel) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("vc_rename")
        .setLabel("🔤 Channel umbenennen")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("vc_limit")
        .setLabel("👥 Nutzerlimit setzen")
        .setStyle(ButtonStyle.Secondary)
    );

    const replyOptions = {
      content: `🛠️ **Bedienfeld für deinen Channel:** \`${userChannel.name}\``,
      components: [row],
      flags: ["Ephemeral"] as const,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  },
} satisfies SlashCommand;
