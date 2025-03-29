import { Metadata } from "next";
import { dashboardConfig } from "@yurna/config";
import prismaClient from "@yurna/database";
import { getGuild, getGuildPreview } from "@yurna/util/functions/guild";
import { notFound } from "next/navigation";
import Balancer from "react-wrap-balancer";
import { Leaderboard } from "@/app/dashboard/[server]/leaderboard/components/Leaderboard";
import { Block } from "@/components/ui/Block";
import Header, { headerVariants } from "@/components/ui/Headers";
import Image from "@/components/ui/Image";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ server: string }> }): Promise<Metadata> {
 const { server } = await params;
 const guild = await prismaClient.guild.findFirst({
  where: {
   OR: [
    {
     guildId: server,
    },
    {
     vanity: server,
    },
   ],
  },
 });

 if (!guild || !guild.guildId || !guild.publicPage)
  return {
   title: "Public Server Overview",
   description: "View the overview of your server.",
  };

 const serverDownload = await getGuild(guild.guildId);

 if (!serverDownload || !serverDownload.bot)
  return {
   title: "Public Server Overview",
   description: "View the overview of your server.",
  };

 const guildPreview = await getGuildPreview(serverDownload.id);
 if (!guildPreview || !guildPreview.id)
  return {
   title: "Public Server Overview",
   description: "View the overview of your server.",
  };

 return {
  title: `${guildPreview.name || "Unnamed server"}`,
  description: guildPreview.description || "View the overview of your server.",
  openGraph: {
   title: `${guildPreview.name || "Unnamed server"}`,
   description: guildPreview.description || "View the overview of your server.",
   url: dashboardConfig.url,
   siteName: dashboardConfig.title,
  },
 };
}

export default async function Page(props: { params: Promise<{ server: string }> }) {
 const params = await props.params;
 const { server } = params;

 const guild = await prismaClient.guild.findFirst({
  where: {
   OR: [
    {
     guildId: server,
    },
    {
     vanity: server,
    },
   ],
  },
  include: {
   guildXp: {
    orderBy: {
     xp: "desc",
    },
    take: 5,
    include: {
     user: {
      select: {
       discordId: true,
       global_name: true,
       name: true,
       avatar: true,
       discriminator: true,
      },
     },
    },
   },
   guildPartners: {
    orderBy: {
     createdAt: "desc"
    }
   }
  },
 });

 if (!guild || !guild.guildId || !guild.publicPage) return notFound();

 const guildPreview = await getGuildPreview(guild.guildId);
 if (!guildPreview || !guildPreview.id) return notFound();

 const data = guild.guildXp.map((x: any, i: number) => {
  return {
   id: i + 1,
   user: x.user,
   xp: x.xp,
   level: Math.floor(0.1 * Math.sqrt(x.xp || 0)),
  };
 });

 return (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <Header className={cn(headerVariants({ variant: "h1" }), "mb-6 flex-col justify-normal")}>
    {guildPreview.icon ? <Image src={`https://cdn.discordapp.com/icons/${guildPreview.id}/${guildPreview.icon}.${guildPreview.icon.startsWith("a_") ? "gif" : "png"}`} alt={guildPreview.name} quality={95} width={96} height={96} className="size-24 rounded-full" /> : <div className="size-24 rounded-full bg-button-secondary" />}
    <div className="flex flex-col text-center sm:ml-4">
     {guildPreview.name || "Unnamed server"}
     <Header className={cn(headerVariants({ variant: "h5", alignment: "center" }), "mt-2 opacity-60")}>
      <Balancer>{guildPreview.description || "This server has no description, maybe you should add one?"}</Balancer>
     </Header>
    </div>
   </Header>

   <Block className="mt-4! flex w-full flex-col gap-4 p-4! sm:flex-row sm:gap-0">
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
     <div className="flex items-center">
      <div className="mr-2 size-3 shrink-0 rounded-full bg-[#81848f]" />
      {guildPreview.approximate_member_count || "0"} members
     </div>
     <div className="flex items-center">
      <div className="mr-2 size-3 shrink-0 rounded-full bg-[#22a55b]" />
      {guildPreview.approximate_presence_count || "0"} online
     </div>
    </div>
    <span className="mx-auto whitespace-nowrap sm:ml-auto sm:mr-0">Powered by Yurna.info</span>
   </Block>

   <div className="mt-6 block gap-6 lg:flex lg:items-start">
    <Block className="scrollbar-show flex flex-col justify-start overflow-x-scroll [flex:3_1_0]">
     <Header className={cn(headerVariants({ variant: "h4", margin: "wide" }), "items-start justify-normal opacity-80")}>Leaderboard</Header>
     {data.length > 0 ? <Leaderboard data={data} showSearch={false} showControls={false} /> : <span className="opacity-50">No users found. Maybe you should try talking in chat?</span>}
    </Block>
    <div className="mt-6 flex flex-col justify-start gap-6 [flex:2_1_0%] lg:mt-0">
     <Block>
      <Header className={cn(headerVariants({ variant: "h4", margin: "wide" }), "items-start justify-normal opacity-80")}>
       Emojis
       <span className="ml-auto font-medium opacity-60">{guildPreview.emojis.length || "0"}</span>
      </Header>
      {guildPreview.emojis && guildPreview.emojis.length > 0 ? (
       <div className="flex flex-row flex-wrap gap-4">
        {guildPreview.emojis.map((emoji: any) => (
         <Link key={emoji.id || "" + emoji.name} className="flex flex-col items-center justify-center gap-2" href={`https://cdn.discordapp.com/emojis/${emoji?.id}.${emoji?.animated ? "gif" : "png"}`} target="_blank" rel="noreferrer noopener">
          <Tooltip content={emoji.name || "Unnamed emoji"}>
           <>
            <Image src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`} alt={emoji.name || ""} quality={95} width={32} height={32} className="size-8 shrink-0" />
           </>
          </Tooltip>
         </Link>
        ))}
       </div>
      ) : (
       <span className="opacity-50">No emojis found.</span>
      )}
     </Block>

     <Block>
      <Header className={cn(headerVariants({ variant: "h4", margin: "wide" }), "items-start justify-normal opacity-80")}>
       Stickers
       <span className="ml-auto font-medium opacity-60">{guildPreview.stickers.length || "0"}</span>
      </Header>
      {guildPreview.stickers && guildPreview.stickers.length > 0 ? (
       <div className="flex flex-row flex-wrap gap-4">
        {guildPreview.stickers.map((sticker: any) => (
         <Link key={sticker.id + sticker.name} className="flex flex-col items-center justify-center gap-2" href={`https://cdn.discordapp.com/stickers/${sticker.id}.${sticker.format_type === 1 ? "png" : sticker.format_type === 2 ? "apng" : sticker.format_type === 3 ? "lottie" : "gif"}`} target="_blank" rel="noreferrer noopener">
          <Tooltip content={sticker.name || "Unnamed sticker"}>
           <>
            <Image unoptimized src={`https://cdn.discordapp.com/stickers/${sticker.id}.${sticker.format_type === 1 ? "png" : sticker.format_type === 2 ? "apng" : sticker.format_type === 3 ? "lottie" : "gif"}`} alt={sticker.name} quality={95} width={96} height={96} className="size-24 shrink-0" />
           </>
          </Tooltip>
         </Link>
        ))}
       </div>
      ) : (
       <span className="opacity-50">No stickers found.</span>
      )}
     </Block>
    </div>
   </div>

   {/* Partner Server Section */}
   {guild.guildPartners && guild.guildPartners.length > 0 && (
    <div className="mt-6">
      <Block>
        <Header className={cn(headerVariants({ variant: "h4", margin: "wide" }), "items-start justify-normal opacity-80")}>
          Partner Server
          <span className="ml-auto font-medium opacity-60">{guild.guildPartners.length || "0"}</span>
        </Header>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {guild.guildPartners.map((partner: any) => (
            <div key={partner.id} className="flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50">
              {partner.hasBanner && (
                <div className="h-24 w-full overflow-hidden">
                  <Image
                    src={`/api/partners/${guild.guildId}/${partner.id}/banner.png?timestamp=${new Date().getTime()}`}
                    alt={`${partner.name} banner`}
                    width={320}
                    height={96}
                    className="h-24 w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-3">
                <h3 className="text-lg font-semibold">{partner.name}</h3>
                {partner.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{partner.description}</p>
                )}
                
                {/* Show extra information when bot is on the partner server */}
                {partner.partnerGuildId && partner.partnerGuild && (
                  <div className="mt-2 space-y-2 text-xs text-neutral-400">
                    {/* Partnership date */}
                    <div className="flex items-center gap-1">
                      <Icons.Calendar className="h-3.5 w-3.5" />
                      <span>Partner seit: {new Date(partner.partnershipDate).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Member count */}
                    {partner.partnerGuild.memberCount && (
                      <div className="flex items-center gap-1">
                        <Icons.Users className="h-3.5 w-3.5" />
                        <span>Mitglieder: {partner.partnerGuild.memberCount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Server creation date */}
                    {partner.partnerGuild.createdAt && (
                      <div className="flex items-center gap-1">
                        <Icons.Clock className="h-3.5 w-3.5" />
                        <span>Erstellt am: {new Date(partner.partnerGuild.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Partner server public link */}
                    {partner.publicLink && (
                      <div className="flex items-center gap-1">
                        <Icons.ExternalLink className="h-3.5 w-3.5" />
                        <a 
                          href={partner.publicLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Server Link
                        </a>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {partner.tags && partner.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {partner.tags.map((tag: string, index: number) => (
                          <span key={index} className="rounded-md bg-neutral-800 px-1.5 py-0.5 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Block>
    </div>
   )}
  </div>
 );
}
