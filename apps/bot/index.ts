import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfig, botConfig, debuggerConfig, dashboardConfig, globalPermissions, reactionRoleConfig } from "@yurna/config";
import { createErrorEmbed } from "@yurna/util/embeds";
import { Logger, chalk } from "@yurna/util/functions/util";
// import type { GiveawaysManager } from "discord-giveaways";
import { GiveawaysManager } from "discord-giveaways";
import { Client, type CommandInteraction, GatewayIntentBits, Collection, Partials } from "discord.js";
import giveaway from "@/util/giveaway/core";
import loadCommands from "@/util/loaders/loadCommands";
import loadEmojis from "@/util/loaders/loadEmojis";
import loadEvents from "@/util/loaders/loadEvents";
import loadFonts from "@/util/loaders/loadFonts";
import loadModals, { type Modal } from "@/util/loaders/loadModals";
import type { SlashCommand } from "@/util/types/Command";

const cwd = dirname(fileURLToPath(import.meta.url));
Logger("info", `Current working directory: ${cwd}`);
process.chdir(cwd);

Logger("info", "Starting Yurna.info Bot...");
Logger("info", `Running version v${process.env.npm_package_version} on Node.js ${process.version} on ${process.platform} ${process.arch}`);

class Yurnabot extends Client {
 // eslint-disable-next-line typescript/no-explicit-any
 public config: Record<string, any> = {};
 public modals: Collection<string, Modal> = new Collection();
 public slashCommands: Collection<string, SlashCommand> = new Collection();
 public additionalSlashCommands: number = 0;
 public commandsRan: number = 0;
 public giveawaysManager: GiveawaysManager = {} as GiveawaysManager;
 public errorMessages: {
  internalError: (interaction: CommandInteraction, error: unknown) => Promise<void>;
  createSlashError: (interaction: CommandInteraction, description: string, title?: string) => void;
 } = {
  internalError: async (interaction: CommandInteraction, error: unknown): Promise<void> => {
   Logger("error", error?.toString() ?? "Unknown error occurred");
   const embed = createErrorEmbed("An error occurred while executing this command. Please try again later.", "Unknown error occurred");
   await interaction.followUp({ embeds: [embed], ephemeral: true });
  },
  createSlashError: (interaction: CommandInteraction, description: string, title?: string): void => {
   const embed = createErrorEmbed(description, title);
   embed.setFooter({
    text: `Requested by ${interaction.user.globalName ?? interaction.user.username}`,
    iconURL: interaction.user.displayAvatarURL(),
   });
   interaction.followUp({ embeds: [embed], ephemeral: true });
  },
 };
 public debugger: (type: "info" | "event" | "error" | "warn" | "ready" | "cron", message: string | unknown) => void = (type, message) => {
  Logger(type, message);
 };
 public performance: (time: number) => string = (time: number): string => {
  const run = Math.floor(performance.now() - time);
  return run > 500 ? chalk.underline.red(`${run}ms`) : chalk.underline(`${run}ms`);
 };
}

const client = new Yurnabot({
 intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.AutoModerationConfiguration, GatewayIntentBits.AutoModerationExecution, GatewayIntentBits.GuildMessagePolls, GatewayIntentBits.DirectMessagePolls],
 partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.config = {
 ...botConfig,
 ...globalPermissions,
 ...globalConfig,
 ...debuggerConfig,
 ...dashboardConfig,
 ...reactionRoleConfig,
 logChannelId: "1351286961700081865",
};

await loadCommands(client);
await loadModals(client);
await loadFonts(client);
await loadEvents(client);
await loadEmojis(client);

client.giveawaysManager = giveaway(client) as unknown as GiveawaysManager;

Logger("info", "Logging in...");

client.on("debug", (invite) => {
 if (client.config.displayDebugMessages) Logger("info", invite);
});

process.on("unhandledRejection", (reason) => {
 Logger("error", `Unhandled rejection: ${reason}`);
});

process.on("uncaughtException", (error) => {
 Logger("error", `Uncaught exception: ${error}`);
});

process.on("warning", (warning) => {
 Logger("warn", `Warning: ${warning}`);
});

await client.login(process.env.TOKEN);

export default client;
export type { Yurnabot };
