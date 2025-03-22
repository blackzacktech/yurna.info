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

export async function messageReactionAdd(client: ClientWithConfig, reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (!reaction.message.guild) return;

    const channelConfig = client.config.channels[reaction.message.channel.id];
    if (channelConfig && channelConfig[reaction.message.id]) {
        const roleConfig = channelConfig[reaction.message.id].find(
            (role) =>
                role.emoji === reaction.emoji.toString() ||
                (role.emoji.includes(":") && role.emoji.split(":")[2].slice(0, -1) === reaction.emoji.id)
        );

        if (roleConfig) {
            const member = reaction.message.guild.members.cache.get(user.id);
            if (!member) return;

            const addedRoles: string[] = [];

            // ➤ Exklusiver Modus: Alte Reaktionen und Rollen entfernen
            if (roleConfig.exclusive) {
                for (const otherRoleConfig of channelConfig[reaction.message.id]) {
                    if (otherRoleConfig.emoji !== reaction.emoji.toString()) {
                        // Entferne die vorherige Reaktion
                        const oldReaction = reaction.message.reactions.cache.find(
                            (r) => r.emoji.toString() === otherRoleConfig.emoji
                        );

                        if (oldReaction) {
                            await oldReaction.users.remove(user.id).catch(console.error);
                        }

                        // Entferne die alte Rolle
                        for (const roleId of otherRoleConfig.ids) {
                            const role = reaction.message.guild.roles.cache.get(roleId);
                            if (role && member.roles.cache.has(role.id)) {
                                await member.roles.remove(role).catch(console.error);
                            }
                        }
                    }
                }
            }

            // ➤ Neue Rolle hinzufügen
            for (const roleId of roleConfig.ids) {
                const role = reaction.message.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role).catch(console.error);
                    addedRoles.push(role.name);
                } else {
                    console.error(`Role not found for ID: ${roleId}`);
                }
            }

            // ➤ Log-Nachricht senden
            const logChannel = client.channels.cache.get(client.config.logChannelId) as TextChannel;
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🟩 Exklusive Rolle ausgewählt")
                    .setColor("Green")
                    .addFields(
                        { name: "Server", value: reaction.message.guild.name, inline: true },
                        { name: "Benutzer", value: `${user.tag}`, inline: true },
                        { name: "Rollen", value: addedRoles.join(", ") || "Keine", inline: false },
                        { name: "Zeitpunkt", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: "Reaktionsrollen-System", iconURL: client.user?.displayAvatarURL() ?? undefined });

                logChannel.send({ embeds: [logEmbed] });
            }
        }
    }
}
