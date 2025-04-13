import type {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    Message,
    ApplicationCommandOptionData,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
  } from "discord.js";
  import type { Yurnabot } from "@/index";
  import type { Guild, GuildDisabledCategories, GuildDisabledCommands } from "@yurna/database/types";
  
  export interface GuildSettings extends Pick<Guild, "embedColor" | "publicPage" | "vanity"> {
    guildDisabledCommands: GuildDisabledCommands[];
    guildDisabledCategories: GuildDisabledCategories[];
  }
  
  type ExtendedApplicationCommandOptionData = ApplicationCommandOptionData & { usage?: string };
  
  export interface SlashCommand extends ChatInputApplicationCommandData {
    category?: string;
    cooldown?: number;
    defer?: boolean;
    usage: string;
    options?: readonly ExtendedApplicationCommandOptionData[];
  
    // ✅ HINZUGEFÜGT:
    apiData?: RESTPostAPIChatInputApplicationCommandsJSONBody;
  
    run: (
      client: Yurnabot,
      interaction: ChatInputCommandInteraction,
      guildSettings?: GuildSettings
    ) => Promise<Message | void>;
  
    autocomplete?: (client: Yurnabot, interaction: AutocompleteInteraction) => Promise<void>;
  }
  