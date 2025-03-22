import prismaClient from "@yurna/database";
import { Logger } from "@yurna/util/functions/util";
import type { Guild } from "discord.js";

export async function GuildDelete({ guild }: { guild: Guild }): Promise<void> {
 try {
  const guildExists = await prismaClient.guild.findFirst({
   where: {
    guildId: guild.id,
   },
  });

  if (guildExists) {
   await prismaClient.guild.delete({
    where: {
     guildId: guild.id,
    },
   });
  }
 } catch (error: unknown) {
  Logger("error", "Failed to create guild:", error);
 }
}
