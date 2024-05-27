import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { getImageByTag } from "@yurna/util/images"; // Stellen Sie sicher, dass der Pfad korrekt ist
import { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
 name: "nsfw",
 description: "🖼 Get an nsfw image by tag",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/nsfw <tag>",
 options: [
  {
   name: "tag",
   description: "Tag to fetch the nsfw image for",
   type: ApplicationCommandOptionType.String,
   required: true,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const tag = interaction.options.getString("tag");
   const imageDetails = await getImageByTag("animals", tag);

   if (!imageDetails) {
    return client.errorMessages.createSlashError(interaction, "❌ No results found or failed to fetch image.");
   }

   const response = await fetch(imageDetails.imageUrl);
   if (!response.ok) throw new Error("Failed to fetch the image.");
   const arrayBuffer = await response.arrayBuffer();
   const buffer = Buffer.from(arrayBuffer);
   const tempPath = path.join(tmpdir(), "image.png");
   await writeFile(tempPath, buffer);

   const file = new AttachmentBuilder(createReadStream(tempPath), { name: "image.png" });

   const embed = new EmbedBuilder()
    .setTitle(`🖼 Image for ${tag}`)
    .setImage("attachment://image.png")
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });

   return interaction.followUp({ embeds: [embed], files: [file] });
  } catch (err) {
   console.error("Error in Images Command:", err);
   client.errorMessages.internalError(interaction, err);
  }
 },
};
