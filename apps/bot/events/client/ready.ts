import topggSDK from "@top-gg/sdk";
import { PresenceUpdateStatus, ActivityType, REST, Routes, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { postBotCommands, postBotStats } from "discordbotlist";
import { reactionRoleSetup } from "@/events/reaction/reactionRoleSetup";
import type { Yurnabot } from "@/index";

export async function ready(client: Yurnabot) {
    if (!client.user) return client.debugger("error", "Client user is not available!");
    if (!client.application) return client.debugger("error", "Client application is not available!");
  
    // ➤ Reaction Role Setup starten
    await reactionRoleSetup(client);
  
    const registerTime = performance.now();
    client.debugger("info", "Registering slash commands...");
  
    // 🌍 GLOBAL REGISTRIERUNG
    client.application.commands
      .set(client.slashCommands.map((command) => command))
      .catch((error: Error) => {
        client.debugger("error", error);
      })
      .then((commands) => {
        if (commands) {
          const percentage = Math.round((commands.size / client.slashCommands.size) * 100);
          client.debugger(
            "ready",
            `✅ Global: ${commands.size + client.additionalSlashCommands} Slash-Commands registriert (${percentage}%) in ${client.performance(registerTime)}`
          );
        } else {
          client.debugger("error", "❌ Failed to register global commands.");
        }
      });
  
    // 🧪 DEV-SERVER REGISTRIERUNG
    const devGuildId = process.env.DEV_GUILD_ID || "DEIN_DEV_SERVER_ID";
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
  
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, devGuildId),
        {
          body: [...client.slashCommands.values()].map((cmd) => cmd.apiData),

        }
      );
      client.debugger("ready", `🧪 Slash-Commands wurden für Dev-Server (${devGuildId}) erfolgreich registriert!`);
    } catch (error) {
      client.debugger("error", `❌ Fehler beim Registrieren der Dev-Server-Commands: ${error}`);
    }

 client.debugger("ready", `Logged in as ${client.user.tag}, ID: ${client.user.id}`);

 // ➤ Top.gg Posting
 if (process.env.TOPGG_API_KEY) {
    const topgg = new topggSDK.Api(process.env.TOPGG_API_KEY);

    setInterval(async () => {
      client.debugger("info", "Posting stats to top.gg");
      await topgg.postStats({
        serverCount: client.guilds.cache.size,
        shardCount: client.ws.shards.size,
        shardId: client.ws.shards.first()?.id,
      });
    }, 300000); // alle 5 Minuten
  }

  // ➤ discordbotlist.com Posting
  setInterval(async () => {
    if (process.env.DISCORD_BOT_LIST_API_KEY && client.user) {
      client.debugger("info", "Posting stats to discordbotlist.com");
      await postBotStats(process.env.DISCORD_BOT_LIST_API_KEY, client.user.id, {
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
      });

      await postBotCommands(
        process.env.DISCORD_BOT_LIST_API_KEY,
        client.user.id,
        client.slashCommands.map((command) => command) as RESTPutAPIApplicationCommandsJSONBody
      );
    }
  }, 300000);

  // ➤ Präsenz aktualisieren
  setInterval(async () => {
    if (!client.user) return;
    client.user.setActivity(
      client.config.presence.activity.type === ActivityType.Custom
        ? client.config.presence.activity.state
        : client.config.presence.activity.name,
      {
        type: client.config.presence.activity.type,
      }
    );
    client.user.setStatus(client.config.presence.status ?? PresenceUpdateStatus.Online);
  }, 60000);
}