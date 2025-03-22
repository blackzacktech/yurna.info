import { Client, TextChannel, Message } from "discord.js";

export async function reactionRoleSetup(client: Client): Promise<void> {
 const reactionRoleConfig = client.config.channels;

 for (const [channelId, messages] of Object.entries(reactionRoleConfig)) {
  const channel = client.channels.cache.get(channelId) as TextChannel;

  if (!channel) {
   console.error(`❌ Kanal mit der ID ${channelId} wurde nicht gefunden.`);
   continue;
  }

  for (const [messageId, roles] of Object.entries(messages)) {
   try {
    const message: Message | null = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
     console.error(`❌ Nachricht mit der ID ${messageId} wurde nicht gefunden.`);
     continue;
    }

    for (const role of roles) {
     const { emoji } = role;

     // Prüfen, ob die Reaktion bereits existiert
     const existingReaction = message.reactions.cache.find((reaction) => reaction.emoji.toString() === emoji);

     // Fehlt die Reaktion? ➔ Hinzufügen!
     if (!existingReaction) {
      await message.react(emoji).catch((err) => {
       console.error(`❌ Fehler beim Hinzufügen der Reaktion ${emoji}:`, err);
      });
     }
    }

    console.log(`✅ Alle fehlenden Reaktionen wurden erfolgreich hinzugefügt für Nachricht ${messageId}`);
   } catch (error) {
    console.error(`❌ Fehler beim Verarbeiten der Nachricht ${messageId}:`, error);
   }
  }
 }
}
