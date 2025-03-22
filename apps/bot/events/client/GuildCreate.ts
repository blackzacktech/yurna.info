import prismaClient from "@yurna/database";
import { Logger } from "@yurna/util/functions/util";
import type { Guild } from "discord.js";

export async function GuildCreate({ guild }: { guild: Guild }): Promise<void> {
 try {
  await prismaClient.guild.upsert({
   where: {
    guildId: guild.id,
   },
   update: {},
   create: {
    guildId: guild.id,
   },
  });
 } catch (error: unknown) {
  Logger("error", "Failed to create guild:", error);
 }
}
