import { Client, Collection, ChannelType, GuildMember, VoiceState, VoiceChannel, OverwriteResolvable } from "discord.js";

// Verwende eine globale Collection, um den Status zu speichern
const voiceManager = new Collection<string, string>();

async function transferOwnership(channel: VoiceChannel, members: Collection<string, GuildMember>): Promise<void> {
    const randomMember = members.random();
    if (!randomMember) return;

    await randomMember.voice.setChannel(channel);
    await channel.setName(randomMember.user.username);
    const permissions: OverwriteResolvable[] = [
        {
            id: randomMember.id,
            allow: ["Connect", "ManageChannels"],
        },
    ];

    await channel.permissionOverwrites.edit(randomMember, permissions[0]);
    voiceManager.set(randomMember.id, channel.id);
}

async function handleChannelLeave(member: GuildMember, channel: VoiceChannel): Promise<void> {
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

export async function voiceStateUpdate(client: Client, oldState: VoiceState, newState: VoiceState): Promise<void> {
    const { guild } = oldState;
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;
    const JTC_CHANNELS = ["1154151562491469934", "1153372954835570762", "1177352222846230571"];

    // Wenn ein Nutzer einem Voice Channel beitritt
    if (oldChannel !== newChannel && newChannel && JTC_CHANNELS.includes(newChannel.id)) {
        const { member } = newState;
        if (!member) return;

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
        const member = oldState.member;
        if (member) await handleChannelLeave(member, oldChannel);
    }
}
