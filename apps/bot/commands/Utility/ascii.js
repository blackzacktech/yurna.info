import { promisify } from "util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder } from "discord.js";
import figlet from "figlet";

const figletAsync = promisify(figlet);

export default {
 name: "ascii",
 description: "✍️ Convert text to ASCII",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/ascii <text>",
 options: [
  {
   name: "text",
   description: "The text to convert",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 500,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const text = interaction.options.getString("text");

   const data = await figletAsync(text);

   const embed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setTitle(`${client.config.emojis.success} Your ascii code has been successfully generated!`)
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   const attached = new AttachmentBuilder().setName("ascii.txt").setFile(Buffer.from(data));
   await interaction.followUp({ ephemeral: false, embeds: [embed], files: [attached] });
  } catch (err) {
   await client.errorMessages.internalError(interaction, err);
  }
 },
};
