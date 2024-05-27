import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import flipText from "flip-text";

export default {
 name: "flip",
 description: "🔁 Flip text (upside down) or 🪙 Flip coin (heads or tails)",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/flip <coin | text>",
 options: [
  {
   name: "coin",
   description: "🪙 Flip coin (heads or tails)",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/flip coin",
  },
  {
   name: "text",
   description: "🔁 Flip text (upside down)",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/flip text",
   options: [
    {
     name: "text",
     description: "Text to flip",
     required: true,
     type: ApplicationCommandOptionType.String,
     max_length: 100,
    },
   ],
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   if (interaction.options.getSubcommand() == "coin") {
    const coin = Math.floor(Math.random() * 2) + 1;
    const embed = new EmbedBuilder()
     .setTitle("🪙 Coin Flip")
     .setDescription(`>>> **You flipped a ${coin == 1 ? "heads" : "tails"}!**`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setThumbnail(interaction.member.user.displayAvatarURL({ size: 256 }))
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    await interaction.followUp({ embeds: [embed] });
   } else if (interaction.options.getSubcommand() == "text") {
    const text = interaction.options.getString("text");
    const embed = new EmbedBuilder()
     .setTitle("🔁 Flipped Text")
     .setDescription(`>>> **${flipText(text)}**`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setThumbnail(interaction.member.user.displayAvatarURL({ size: 256 }))
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    await interaction.followUp({ embeds: [embed] });
   }
  } catch (err) {
   await client.errorMessages.internalError(interaction, err);
  }
 },
};
