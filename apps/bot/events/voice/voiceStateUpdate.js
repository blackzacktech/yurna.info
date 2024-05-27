//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

import { Collection, ChannelType } from "discord.js";

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

// Verwende eine globale Collection, um den Status zu speichern
const voiceManager = new Collection();

async function transferOwnership(channel, members) {
 const randomMember = members.random();
 await randomMember.voice.setChannel(channel);
 await channel.setName(randomMember.user.username);
 await channel.permissionOverwrites.edit(randomMember, {
  CONNECT: true,
  MANAGE_CHANNELS: true,
 });
 voiceManager.set(randomMember.id, channel.id);
}

async function handleChannelLeave(member, channel) {
 const JTCCHANNEL = voiceManager.get(member.id);
 if (JTCCHANNEL && channel.id === JTCCHANNEL) {
  const nonBotMembers = channel.members.filter((m) => !m.user.bot);
  if (nonBotMembers.size > 0) {
   await transferOwnership(channel, nonBotMembers);
  } else {
   voiceManager.delete(member.id);
   await channel.delete().catch(console.error);
  }
 }
}

export async function voiceStateUpdate(client, oldState, newState) {
 const { guild } = oldState;
 const newChannel = newState.channel;
 const oldChannel = oldState.channel;
 const JTC_CHANNELS = ["1154151562491469934", "1153372954835570762", "1177352222846230571"];

 // Wenn ein Nutzer einem Voice Channel beitritt
 if (oldChannel !== newChannel && newChannel && JTC_CHANNELS.includes(newChannel.id)) {
  const { member } = newState;
  const voiceChannel = await guild.channels.create({
   name: `🗣️-${member.user.username}`,
   type: ChannelType.GuildVoice,
   parent: newChannel.parent,
   permissionOverwrites: [
    {
     id: member.id,
     allow: ["Connect", "ManageChannels"],
    },
    {
     id: guild.id,
     allow: ["Connect"],
    },
   ],
  });

  voiceManager.set(member.id, voiceChannel.id);
  await newChannel.permissionOverwrites.edit(member, { Connect: false });
  setTimeout(() => newChannel.permissionOverwrites.delete(member), 30 * 1000);
  setTimeout(() => member.voice.setChannel(voiceChannel), 600);
 }

 // Wenn ein Nutzer einen Voice Channel verlässt oder wechselt
 if (oldChannel && (!newChannel || newChannel.id !== oldChannel.id)) {
  await handleChannelLeave(oldState.member, oldChannel);
 }
}

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
