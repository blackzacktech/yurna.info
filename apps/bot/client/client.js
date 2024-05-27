//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Import´s ——————————————————————————————————————————————————————————————————————————————————————————

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfig, botConfig, debuggerConfig, dashboardConfig, globalPermissions, reactionRoleConfig } from "@yurna/config";
import prismaClient from "@yurna/database";
import { createErrorEmbed } from "@yurna/util/embeds";
import { Logger, chalk } from "@yurna/util/functions/util";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import giveaway from "../util/giveaway/core.js";
import loadCommands from "../util/loaders/loadCommands.js";
import loadEvents from "../util/loaders/loadEvents.js";
import loadFonts from "../util/loaders/loadFonts.js";
import loadModals from "../util/loaders/loadModals.js";

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Infos —————————————————————————————————————————————————————————————————————————————————————————————

const cwd = dirname(fileURLToPath(import.meta.url)).replace("/client", "");
Logger("info", `Current working directory: ${cwd}`);
process.chdir(cwd);

Logger("info", "Starting Yurna.info Bot...");
Logger("info", `Running version v${process.env.npm_package_version} on Node.js ${process.version} on ${process.platform} ${process.arch}`);
Logger("info", "Check out the source code at https://github.com/blackzacktech/yurna.info! Don't forget to star the repository, it helps a lot!");

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Client ————————————————————————————————————————————————————————————————————————————————————————————

const client = new Client({
 intents: [
  // Prettier
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.MessageContent,
 ],
 partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.config = {
 ...botConfig,
 ...globalPermissions,
 ...globalConfig,
 ...debuggerConfig,
 ...dashboardConfig,
 ...reactionRoleConfig,
};

client.commandsRan = 0;

client.giveawaysManager = giveaway(client);

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Error handler —————————————————————————————————————————————————————————————————————————————————————

client.errorMessages = {
 internalError: (interaction, error) => {
  Logger("error", error?.toString() ?? "Unknown error occured");
  const embed = createErrorEmbed("An error occured while executing this command. Please try again later.", "Unknown error occured");
  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
 createSlashError: (interaction, description, title) => {
  const embed = createErrorEmbed(description, title);
  embed.setFooter({
   text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
   iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }),
  });

  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Debugger ——————————————————————————————————————————————————————————————————————————————————————————

client.debugger = Logger;

client.performance = (time) => {
 const run = Math.floor(performance.now() - time);
 return run > 500 ? chalk.underline.red(`${run}ms`) : chalk.underline(`${run}ms`);
};

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? ————————————————————————————————————————————— Loader ————————————————————————————————————————————————————————————————————————————————————————————

await loadCommands(client);
await loadModals(client);
await loadFonts(client);
await loadEvents(client);

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————— Server User and Public Server counting ———————————————————————————————————————————————————————————————

// Funktion, um den Kanal mit der Anzahl der Servermitglieder umzubenennen
async function updateMemberCountChannel(client, guildId, channelId) {
 try {
  const guild = await client.guilds.fetch(guildId);
  const { memberCount } = guild;
  const channel = await guild.channels.fetch(channelId);
  await channel.setName(`Member: ${memberCount}`);
 } catch (error) {
  // Logger("warn", `Error updating member count channel: ${error.message}`);
 }
}

// Funktion, um den Kanal mit der Anzahl verbundener Server umzubenennen
async function updateServerCountChannel(client, channelId) {
 try {
  const serverCount = client.guilds.cache.size;
  const channel = await client.channels.fetch(channelId);
  await channel.setName(`Verbunden mit: ${serverCount} Servern`);
 } catch (error) {
  // Logger("warn", `Error updating server count channel: ${error.message}`);
 }
}

// Event-Listener, der die Funktionen aufruft, wenn sich die entsprechenden Zahlen ändern
client.on("guildMemberAdd", (member) => updateMemberCountChannel(client, member.guild.id, "1154151312565469265"));
client.on("guildMemberRemove", (member) => updateMemberCountChannel(client, member.guild.id, "1154151312565469265"));
client.on("guildCreate", () => updateServerCountChannel(client, "1177621678566670456"));
client.on("guildDelete", () => updateServerCountChannel(client, "1177621678566670456"));

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————— Server User Upload to Database ———————————————————————————————————————————————————————————————————————

export async function addToDatabase(client) {
 for (const guild of client.guilds.cache.values()) {
  try {
   await guild.members.fetch(); // Auf Mitglieder warten
   for (const member of guild.members.cache.values()) {
    try {
     const existingUser = await prismaClient.user.findUnique({
      where: { discordId: member.id },
     });
     if (!existingUser) {
      await prismaClient.user.create({
       data: {
        discordId: member.id,
        name: member.user.username,
        global_name: member.user.tag,
        discriminator: member.user.discriminator,
        avatar: member.user.avatarURL(),
        public_flags: member.user.flags.bitfield,
        locale: member.user.locale,
        nitro: member.user.premiumType,
       },
      });
      // console.log(`Benutzer ${member.user.tag} mit Discord ID ${member.id} zur Datenbank hinzugefügt.`);
     } else {
      // console.log(`Benutzer ${member.user.tag} mit Discord ID ${member.id} bereits in der Datenbank vorhanden. Überspringe.`);
     }
    } catch (error) {
     // console.error(`Fehler beim Hinzufügen des Benutzers ${member.user.tag} auf dem Server ${guild.name} zur Datenbank: ${error}`);
    }
   }
  } catch (error) {
   // console.error(`Fehler beim Abrufen der Mitglieder für den Server ${guild.name}: ${error}`);
  }
 }
}

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

// Fügen Sie diese Zeilen am Ende Ihres Skripts hinzu, um die Kanäle beim Start zu aktualisieren
client.once("ready", () => {
 Logger("info", "Updating channels on startup...");
 client.guilds.cache.forEach((guild) => {
  updateMemberCountChannel(client, guild.id, "1154151312565469265");
  updateServerCountChannel(client, "1177621678566670456");
  addToDatabase(client);
 });
});

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

Logger("info", "Logging in...");

await client.login(process.env.TOKEN);

export default client;

//? —————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
