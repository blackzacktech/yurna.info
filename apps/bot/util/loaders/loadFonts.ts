import { readDir } from "@yurna/util/functions/files/readDir.js";
import { GlobalFonts } from "@napi-rs/canvas";
import type { Yurnabot } from "@/index";

export default async function loadFonts(client: Yurnabot): Promise<void> {
 try {
  const loadTime = performance.now();
  const fonts = await readDir(`${process.cwd()}/util/images/fonts/`, true, [".ttf"]);

  for (const font of fonts) {
   const fontName = font.split("/").pop();

   if (fontName) {
    GlobalFonts.registerFromPath(font, fontName.replace(".ttf", ""));
   } else {
    console.error("Invalid font path:", font);
   }
  }
  client.debugger("event", `Loaded ${fonts.length} fonts in ${client.performance(loadTime)}`);
 } catch (error) {
  client.debugger("error", `Error loading fonts: ${error}`);
 }
}
