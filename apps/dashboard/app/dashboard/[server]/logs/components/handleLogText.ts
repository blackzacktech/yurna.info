import type { GuildLogType } from "@yurna/database/types";
import { capitalize, splitCamelCase } from "@yurna/util/functions/util";

export function handleLogText(log: GuildLogType, toUpperCase = true): string {
 let transformedLog = splitCamelCase(log).toLowerCase();
 if (transformedLog.startsWith("guild")) transformedLog = transformedLog.slice(6);

 return toUpperCase ? capitalize(transformedLog) : transformedLog;
}
