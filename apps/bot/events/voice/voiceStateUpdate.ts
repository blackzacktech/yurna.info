import {
    Client,
    Collection,
    ChannelType,
    GuildMember,
    VoiceState,
    VoiceChannel,
    OverwriteResolvable,
    EmbedBuilder,
} from "discord.js";
import client from "@/index";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Map für Join-to-Create Channels pro Server
const JTC_CHANNELS: Record<string, string[]> = {
    "605270655058968576": ["1154151562491469934"], // Beispiel-Server 1
};

// Nutzer → aktueller JTC-Channel
const voiceManager = new Collection<string, string>();
// Nutzer → Channel wird gerade erstellt
const inCreation = new Set<string>();

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
    const trackedChannel = voiceManager.get(member.id);
    if (trackedChannel && trackedChannel === channel.id) {
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
    const guildId = newState.guild.id;
    const userId = newState.id;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    const member = newState.member;

    // ========== JOIN-TO-CREATE HANDLING ==========
    const jtcIds = JTC_CHANNELS[guildId] ?? [];

    const isJoiningJTC = newChannel && jtcIds.includes(newChannel.id);
    const isLeaving = oldChannel && (!newChannel || oldChannel.id !== newChannel?.id);

    if (isJoiningJTC && member && !inCreation.has(userId)) {
        inCreation.add(userId);

        try {
            const existingChannelId = voiceManager.get(userId);
            if (existingChannelId) {
                const existingChannel = newState.guild.channels.cache.get(existingChannelId);
                if (existingChannel?.isVoiceBased()) {
                    await existingChannel.delete().catch(() => null);
                }
            }

            const voiceChannel = await newState.guild.channels.create({
                name: `🗣️-${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: newChannel.parent,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: ["Connect", "ManageChannels"],
                    },
                    {
                        id: newState.guild.id,
                        allow: ["Connect"],
                    },
                ],
            });

            voiceManager.set(userId, voiceChannel.id);
            await newChannel.permissionOverwrites.edit(member, { Connect: false });

            setTimeout(async () => {
                const current = member.voice.channelId;
                if (!current || current === newChannel.id) {
                    try {
                        await member.voice.setChannel(voiceChannel);
                    } catch { }
                }
            }, 500);

            setTimeout(() => {
                if (newChannel.permissionsFor(member)?.has("Connect") === false) {
                    newChannel.permissionOverwrites.delete(member).catch(() => null);
                }
            }, 30 * 1000);
        } catch (err) {
            console.error("JTC-Error:", err);
        } finally {
            inCreation.delete(userId);
        }
    }

    if (isLeaving && member) {
        await handleChannelLeave(member, oldChannel!);
    }

    // ========== ZENTRALES LOGGING ==========
    const user = member?.user || oldState.member?.user;
    if (!user) return;

    let action = "";
    let description = "";

    if (!oldChannel && newChannel) {
        action = "Voice Join";
        description = `${user.tag} (${user.id}) ist dem Channel **${newChannel.name}** beigetreten.`;
    } else if (oldChannel && !newChannel) {
        action = "Voice Leave";
        description = `${user.tag} (${user.id}) hat den Channel **${oldChannel.name}** verlassen.`;
    } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        action = "Voice Switch";
        description = `${user.tag} (${user.id}) wechselte von **${oldChannel.name}** zu **${newChannel.name}**.`;
    }

    if (!action) return;

    const logChannelId = client.config.logChannelId;
    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel?.isTextBased()) return;

    const now = new Date();
    const fullDate = format(now, "dd.MM.yyyy – HH:mm:ss", { locale: de });
    const shortTime = format(now, "HH:mm", { locale: de });

    const embed = new EmbedBuilder()
        .setColor(action === "Voice Leave" ? 0xff4444 : action === "Voice Switch" ? 0xffcc00 : 0x44ff44)
        .setTitle(`🎙️ ${action}`)
        .setDescription([
            `> 👤 **User:** ${user.tag} (\`${user.id}\`)`,
            `> 📍 **Server:** ${newState.guild.name} (\`${guildId}\`)`,
            `> 📤 **Aktion:** ${description.replace(`${user.tag} (${user.id}) `, "")}`,
            `> 🕒 **Zeit:** ${fullDate} _(heute um ${shortTime} Uhr)_`,
        ].join("\n"))
        .setTimestamp();

    await logChannel.send({ embeds: [embed] });
}
