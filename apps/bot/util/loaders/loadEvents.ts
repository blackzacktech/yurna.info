import { basename } from "node:path";
import { readDir } from "@yurna/util/functions/files/readDir.js";
import type { ClientEvents } from "discord.js";
import type { Yurnabot } from "@/index";

export default async function loadEvents(client: Yurnabot): Promise<void> {
  try {
    const loadTime = performance.now();

    const events = readDir(`${process.cwd()}/events/`, true, [".js", ".ts"]);

    for (const file of events) {
      const e = await import(file);
      const eventName = basename(file).split(".")[0] as keyof ClientEvents;

      const handler = e.default?.execute || e[eventName] || e.default;

      if (typeof handler !== "function") {
        client.debugger("error", `❌ Event "${eventName}" in ${file} hat keine gültige Handler-Funktion.`);
        continue;
      }

      if (client.config.displayEventList) {
        client.debugger("info", `Loaded event ${eventName} from ${file.replace(process.cwd(), "")}`);
      }

      client.on(eventName, handler.bind(null, client));
    }

    client.debugger("event", `Loaded ${events.length} events from /events in ${client.performance(loadTime)}`);
  } catch (error) {
    client.debugger("error", `Error loading events: ${error}`);
  }
}
