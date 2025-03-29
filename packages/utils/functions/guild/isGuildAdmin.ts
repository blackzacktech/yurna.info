import { getGuild } from "./getGuild";
import { getGuildMember } from "./getGuildMember";
import { PermissionFlagsBits } from "discord-api-types/v10";

/**
 * Checks if a user is an admin in a guild.
 * @param serverId The ID of the guild
 * @param userId The ID of the user (optional, defaults to undefined for compatibility)
 * @returns A boolean indicating if the user is an admin
 */
export async function isGuildAdmin(serverId: string, userId?: string): Promise<boolean> {
  try {
    // If no userId is provided, we can't check permissions
    if (!userId) {
      return false;
    }

    // Get the guild and member
    const guild = await getGuild(serverId);
    if (!guild) return false;

    // If the user is the owner of the guild, they are an admin
    if (guild.owner_id === userId) return true;

    // Get the guild member
    const member = await getGuildMember(serverId, userId);
    if (!member) return false;

    // Check if the member has ADMINISTRATOR permission
    const hasAdminPermission = member.permissions && BigInt(member.permissions) & PermissionFlagsBits.Administrator;
    if (hasAdminPermission) return true;

    return false;
  } catch (error) {
    console.error("Error checking guild admin status:", error);
    return false;
  }
}
