import { GuildLogType } from "@yurna/database/types";
import { getGuildLogSettings } from "@yurna/util/database";
import { NonThreadGuildBasedChannel, EmbedBuilder, time, ChannelType, inlineCode } from "discord.js";
import type { Yurnabot } from "@/index";

export async function channelCreate(client: Yurnabot, channel: NonThreadGuildBasedChannel) {
 try {
  if (!channel.guild) return;
  const settings = await getGuildLogSettings(channel.guild.id, GuildLogType.ChannelCreate);
  if (!settings?.enabled || !settings.channelId) return;
  const discordGuild = channel.guild;
  const logChannel = await discordGuild.channels.fetch(settings.channelId);
  if (!logChannel || !logChannel.isTextBased()) return;

  const fields = [
   {
    name: "Channel",
    value: `${channel.toString()} (${inlineCode(channel.name)})`,
   },
   {
    name: "ID",
    value: inlineCode(channel.id),
   },
   {
    name: "Type",
    value: inlineCode(ChannelType[channel.type]),
   },
   {
    name: "Created At",
    value: time(channel.createdAt),
   },
  ];

  const embed = new EmbedBuilder()
   .setTitle("📢 Channel Created")
   .setFields(fields)
   .setColor("#3B82F6")
   .setTimestamp()
   .setFooter({
    text: "Channel created",
    iconURL: discordGuild.iconURL({ size: 256 }) || undefined,
   });

  logChannel.send({ embeds: [embed] });
 } catch (err: unknown) {
  client.debugger("error", err);
 }
}
