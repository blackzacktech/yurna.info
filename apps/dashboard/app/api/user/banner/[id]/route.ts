import { getDiscordUser } from "@yurna/util/functions/user";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
 const params = await props.params;
 try {
  const { id } = params;

  if (!id || !/^\d{17,19}$/.test(id)) return redirect("/assets/fallback.webp");

  const user = await getDiscordUser(id);
  if (!user || !user.banner) return redirect("/assets/fallback.webp");

  if (user.banner.startsWith("a_")) return NextResponse.redirect(`https://cdn.discordapp.com/banners/${id}/${user.banner}.gif?size=1024`);
  return NextResponse.redirect(`https://cdn.discordapp.com/banners/${id}/${user.banner}.webp?size=1024`);
 } catch (_error) {
  return redirect("/assets/fallback.webp");
 }
}
