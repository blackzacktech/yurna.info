import { getGuild } from "./getGuild";
import { prisma } from "@yurna/database";
import { APIGuild } from "discord-api-types/v10";

/**
 * Gets detailed information about a guild, including database data
 * @param serverId The ID of the guild
 * @returns Guild information from both Discord API and database
 */
export async function getGuildInfo(serverId: string) {
  try {
    // Get guild data from Discord API
    const guild = await getGuild(serverId);
    if (!guild) return null;

    // Get guild data from database
    const guildData = await prisma.guild.findUnique({
      where: { id: serverId },
      include: {
        tickets: true,
        ticketCategories: {
          include: {
            questions: true
          }
        }
      }
    });

    // Combine API and database data
    return {
      ...guild,
      data: guildData
    };
  } catch (error) {
    console.error("Error getting guild info:", error);
    return null;
  }
}
