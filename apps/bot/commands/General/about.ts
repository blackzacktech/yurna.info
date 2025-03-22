import { ActionRowBuilder, ApplicationCommandType, ButtonStyle, ButtonBuilder, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from "discord.js";
import type { SlashCommand } from "@/util/types/Command";

export default {
 name: "about",
 description: "🏷️ Learn more about Yurna.info",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 usage: "/about",
 contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
 integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
 run: async (client, interaction, guildSettings) => {
  try {
   if (!client.user) return client.errorMessages.createSlashError(interaction, "❌ Bot is not ready yet. Please try again later.");

   const embed = new EmbedBuilder() // Prettier
    .setTitle(`🤖 About ${client.user.username}`)
    .setDescription(
     `Yurna.info is a Discord bot made for **Memes, Image editing, Giveaways, Moderation, Anime and even more!** 🎉
     
     It is made by the awesome [Blackzack Team & Contributors](https://blackzack.dev).

     ${client.config.url ? `**If you want to invite Yurna.info to your server, you can do so by clicking [here](${client.config.url})**` : ""}
     `
    )
    .setFooter({
     text: `Requested by ${interaction.user.globalName || interaction.user.username}`,
     iconURL: interaction.user.displayAvatarURL({
      size: 256,
     }),
    })
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp();

   if (client.config.url) {
    const action = new ActionRowBuilder<ButtonBuilder>() // prettier
     .addComponents(
      new ButtonBuilder() // prettier
       .setLabel("Dashboard")
       .setStyle(ButtonStyle.Link)
       .setURL(client.config.url),
      new ButtonBuilder() // prettier
       .setLabel("Invite")
       .setStyle(ButtonStyle.Link)
       .setURL(`${client.config.url}/invite`)
     );

    return interaction.followUp({ ephemeral: false, embeds: [embed], components: [action] });
   } else {
    return interaction.followUp({ ephemeral: false, embeds: [embed] });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
} satisfies SlashCommand;
