import prismaClient from "@yurna/database";
import { cacheGet, cacheSet } from "@yurna/database/redis";
import { fetchXPSettings } from "@yurna/util/database";
import {
  EmbedBuilder,
  AttachmentBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonStyle,
  Message,
} from "discord.js";
import type { Yurnabot } from "@/index";
import { createXPCard } from "@/util/images/createXPCard";
import fetch from "node-fetch";

export async function messageCreate(client: Yurnabot, message: Message): Promise<Message | void> {
  if (!client.user || message.author.bot) return;

  // === KI-RESPONSE BEI PRIVATNACHRICHTEN ===
  if (!message.guild && message.channel.type === ChannelType.DM) {
    await message.channel.sendTyping();
    const userInput = message.content;

    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Letzte 10 Nachrichtenverläufe holen
      const conversation = await prismaClient.userConversation.findMany({
        where: {
          userId: message.author.id,
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      const messages = [
        ...conversation.map((c) => ({
          role: c.role,
          content: c.content,
        })),
        { role: "user", content: userInput },
      ];

      const apiUrl = process.env.YURNA_AI;
      if (!apiUrl) throw new Error("❌ Die Umgebungsvariable YURNA_AI ist nicht gesetzt.");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "yurna:latest",
          messages,
          stream: false,
        }),
      });

      const data = await response.json() as { message?: { content?: string } };
      const aiReply = data.message?.content?.trim() || "❌ Es gab ein Problem mit der Antwort.";

      await message.reply(aiReply);

      // Verlauf speichern
      await prismaClient.userConversation.createMany({
        data: [
          {
            userId: message.author.id,
            role: "user",
            content: userInput,
          },
          {
            userId: message.author.id,
            role: "assistant",
            content: aiReply,
          },
        ],
      });

    } catch (err) {
      console.error("❌ Ollama-Fehler:", err);
      await message.reply("❌ Die KI ist aktuell nicht verfügbar.");
    }

    return;
  }

  // === SERVER: Standard-Logik ===
  if (!message.guild || !message.guild.available) return;

  if (message.mentions.users.has(client.user.id) && (!message.reference || !message.reference.messageId)) {
    const embed = new EmbedBuilder()
      .setTitle("👋 Hello!")
      .setDescription(
        `Hello ${message.author}! I'm ${client.user.username}, a multi-purpose Discord bot created for **Memes, Image editing, Giveaways, Moderation, Anime and even more!** 🎉

**You can find the list of all my commands by typing \`/help\`** ${client.config.url ? `or by visiting [my dashboard](${client.config.url}/commands)` : ""}.

${client.config.url ? `**If you want to invite me to your server, you can do so by clicking [here](${client.config.url})**` : ""}`
      )
      .setColor(client.config.defaultColor)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${message.author.globalName || message.author.username}`,
        iconURL: message.author.displayAvatarURL({ size: 256 }),
      });

    if (client.config.url) {
      const action = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setLabel("Dashboard").setStyle(ButtonStyle.Link).setURL(client.config.url),
        new ButtonBuilder().setLabel("Invite").setStyle(ButtonStyle.Link).setURL(`${client.config.url}/invite`)
      );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [action] });
    } else {
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  }

  if (![ChannelType.GuildText, ChannelType.GuildForum, ChannelType.PublicThread, ChannelType.PrivateThread].includes(message.channel.type)) return;

  const date = new Date();

  const messages = await prismaClient.guildMessage.findFirst({
    where: {
      guildId: message.guild.id,
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      },
    },
  });

  if (!messages) {
    await prismaClient.guildMessage.create({
      data: {
        guild: {
          connectOrCreate: {
            where: { guildId: message.guild.id },
            create: { guildId: message.guild.id },
          },
        },
        date: new Date(),
        messages: 1,
      },
    });
  } else {
    await prismaClient.guildMessage.update({
      where: {
        id: messages.id,
      },
      data: {
        messages: {
          increment: 1,
        },
      },
    });
  }

  const settings = await fetchXPSettings(message.guild.id);
  if (!settings || !settings.enableXP) return;

  const key = `user:${message.author.id}:xp:${message.guild.id}`;
  const timeout = await cacheGet(key);
  if (timeout) return;

  const random = Math.floor(Math.random() * 60) + 1;

  const xp = await prismaClient.guildXp.findFirst({
    where: {
      guildId: message.guild.id,
      userId: message.author.id,
    },
  });

  await cacheSet(key, { time: Date.now() }, 60);

  if (!xp) {
    await prismaClient.guildXp.create({
      data: {
        guild: {
          connectOrCreate: {
            where: { guildId: message.guild.id },
            create: { guildId: message.guild.id },
          },
        },
        user: {
          connectOrCreate: {
            where: {
              discordId: message.author.id,
            },
            create: {
              discordId: message.author.id,
              name: message.author.username,
              global_name: message.author.username,
              avatar: message.author.avatar || null,
              discriminator: message.author.discriminator,
            },
          },
        },
        xp: random,
      },
    });
    return;
  }

  await prismaClient.guildXp.updateMany({
    where: {
      guildId: message.guild.id,
      userId: message.author.id,
    },
    data: {
      xp: {
        increment: random,
      },
    },
  });

  if (!settings.enableXPLevelUpMessage) return;

  const level = Math.floor(0.1 * Math.sqrt(xp.xp));
  const xpAfter = xp.xp + random;
  const nextLevel = Math.floor(0.1 * Math.sqrt(xpAfter));

  if (level < nextLevel) {
    if (!message.channel || message.channel.type !== ChannelType.GuildText) return;

    const member = message.guild.members.me;
    if (!member) return;

    const permissions = message.channel.permissionsFor(member);
    if (
      !permissions.has(PermissionsBitField.Flags.SendMessages) ||
      !permissions.has(PermissionsBitField.Flags.EmbedLinks) ||
      !permissions.has(PermissionsBitField.Flags.AttachFiles)
    )
      return;

    message.author.avatar = message.author.displayAvatarURL({ size: 128 });
    const rank = await createXPCard(
      message.author,
      { xp: xpAfter, level: nextLevel, xpNeeded: Math.ceil(Math.pow((nextLevel + 1) / 0.1, 2)) },
      "#10B981"
    );

    const attachment = new AttachmentBuilder(rank, { name: "rank.png" });

    const embed = new EmbedBuilder()
      .setTitle("🎉 Level up!")
      .setDescription(`Congratulations ${message.author}! You have leveled up to level **${nextLevel}**!`)
      .setColor("#10B981")
      .setTimestamp()
      .setImage("attachment://rank.png");

    await message.channel.send({ embeds: [embed], files: [attachment] });
  }
}
