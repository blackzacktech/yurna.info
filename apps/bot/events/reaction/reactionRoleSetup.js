//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

import { EmbedBuilder } from "discord.js";

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

export async function reactionRoleSetup(client) {
 const embed = new EmbedBuilder().setTitle("Reactions").setDescription("React to this messages Reactions to gain cool roles!").setFooter({ text: "Made with ❤️" });
 console.log("✅ | Reaction Role ready!");

 for (const channelId in client.config.channels) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) continue; // Überspringen, wenn der Kanal nicht gefunden wird

  for (const messageId in client.config.channels[channelId]) {
   try {
    let message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
     // Nachricht existiert nicht, also senden wir eine neue
     message = await channel.send({ embeds: [embed] });
    }

    // Reaktionen für die Nachricht hinzufügen oder aktualisieren
    const roles = client.config.channels[channelId][messageId];
    for (const role of roles) {
     if (role.emoji.includes(":")) {
      const emojiId = role.emoji.split(":")[2].slice(0, -1);
      await message.react(emojiId).catch(console.error);
     } else {
      await message.react(role.emoji).catch(console.error);
     }
    }
   } catch (error) {
    console.error(`Fehler beim Verarbeiten von Nachricht ${messageId} im Kanal ${channelId}:`, error);
   }
  }
 }
}

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
