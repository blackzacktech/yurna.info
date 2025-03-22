import { Client, MessageReaction, User, EmbedBuilder, TextChannel } from "discord.js";

interface RoleConfig {
 ids: string[];
 emoji: string;
 exclusive?: boolean;
}

interface ChannelConfig {
 [messageId: string]: RoleConfig[];
}

interface ClientWithConfig extends Client {
 config: {
  channels: {
   [channelId: string]: ChannelConfig;
  };
  logChannelId: string;
 };
}

export async function messageReactionRemove(client: ClientWithConfig, reaction: MessageReaction, user: User): Promise<void> {
 if (user.bot) return;

 if (reaction.partial) await reaction.fetch();
 if (reaction.message.partial) await reaction.message.fetch();

 if (!reaction.message.guild) return;

 const channelConfig = client.config.channels[reaction.message.channel.id];
 if (channelConfig && channelConfig[reaction.message.id]) {
  const roleConfig = channelConfig[reaction.message.id].find((role) => role.emoji === reaction.emoji.toString() || (role.emoji.includes(":") && role.emoji.split(":")[2].slice(0, -1) === reaction.emoji.id));

  if (roleConfig) {
   const member = reaction.message.guild.members.cache.get(user.id);
   if (!member) return;

   const removedRoles: string[] = [];

   for (const roleId of roleConfig.ids) {
    const role = reaction.message.guild.roles.cache.get(roleId);
    if (role && member.roles.cache.has(role.id)) {
     await member.roles.remove(role).catch(console.error);
     removedRoles.push(role.name);
    }
   }

   // ➤ Log-Nachricht senden
   const logChannel = client.channels.cache.get(client.config.logChannelId) as TextChannel;
   if (logChannel) {
    const logEmbed = new EmbedBuilder()
     .setTitle("🟥 Rolle entfernt")
     .setColor("Red")
     .addFields({ name: "Server", value: reaction.message.guild.name, inline: true }, { name: "Benutzer", value: `${user.tag}`, inline: true }, { name: "Entfernte Rollen", value: removedRoles.join(", ") || "Keine", inline: false }, { name: "Zeitpunkt", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true })
     .setFooter({ text: "Reaktionsrollen-System", iconURL: client.user?.displayAvatarURL() ?? undefined });

    logChannel.send({ embeds: [logEmbed] });
   }
  }
 }
}
