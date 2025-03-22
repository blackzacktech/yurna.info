import type { Guild, GuildDisabledCategories, GuildDisabledCommands } from "@yurna/database/types";
import { type ChatInputApplicationCommandData, ChatInputCommandInteraction, AutocompleteInteraction, Message, type ApplicationCommandOptionData } from "discord.js";
import type { Yurnabot } from "@/index";

export interface GuildSettings extends Pick<Guild, "embedColor" | "publicPage" | "vanity"> {
 guildDisabledCommands: GuildDisabledCommands[];
 guildDisabledCategories: GuildDisabledCategories[];
}

// Create a new type that includes the usage property
type ExtendedApplicationCommandOptionData = ApplicationCommandOptionData & { usage?: string };

export interface SlashCommand extends ChatInputApplicationCommandData {
 category?: string;
 cooldown?: number;
 defer?: boolean;
 usage: string;
 options?: readonly ExtendedApplicationCommandOptionData[];
 run: (client: Yurnabot, interaction: ChatInputCommandInteraction, guildSettings?: GuildSettings) => Promise<Message | void>;
 autocomplete?: (client: Yurnabot, interaction: AutocompleteInteraction) => Promise<void>;
}
