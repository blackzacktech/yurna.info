import { globalConfig } from "@yurna/config";
import { cacheGet, cacheSet } from "@yurna/database/redis";
import { RESTGetAPIGuildMemberResult, Snowflake } from "discord-api-types/v10";

/**
 * Fetches a guild member from the Discord API or cache
 * @param guildId The ID of the guild
 * @param userId The ID of the user
 * @returns Guild member data or null if not found
 */
export async function getGuildMember(guildId: Snowflake, userId: Snowflake): Promise<RESTGetAPIGuildMemberResult | null> {
  try {
    // Check cache first
    const cacheKey = `guild:${guildId}:member:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(JSON.stringify(cached));

    // Fetch from API if not in cache
    const response = await fetch(
      `https://discord.com/api/v${globalConfig.apiVersion}/guilds/${guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const member = await response.json();
    
    // Cache result for 5 minutes
    await cacheSet(cacheKey, member, 5 * 60);
    
    return member;
  } catch (error) {
    console.error(`Error fetching guild member (${guildId}, ${userId}):`, error);
    return null;
  }
}
