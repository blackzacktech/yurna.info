import { getGuildFromMemberGuilds, getGuild } from "@yurna/util/functions/guild";
import prismaClient from "@yurna/database";
import { getSession } from "lib/session";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Block } from "@/components/ui/Block";
import Header, { headerVariants } from "@/components/ui/Headers";
import { Icons, iconVariants } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { PartnerList } from "./components/PartnerList";

export default async function Page(props: { params: Promise<{ server: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || !session.access_token) redirect("/auth/login");
  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) return notFound();
  const serverMember = await getGuildFromMemberGuilds(serverDownload.id, session.access_token);
  if (
    // prettier
    !serverMember ||
    !serverMember.permissions_names ||
    (!serverMember.permissions_names.includes("ManageGuild") && 
     !serverMember.permissions_names.includes("Administrator"))
  )
    return notFound();

  const guild = await prismaClient.guild.upsert({
    where: {
      guildId: serverDownload.id,
    },
    update: {},
    create: {
      guildId: serverDownload.id,
    },
  });

  const partners = await prismaClient.guildPartner.findMany({
    where: {
      guildId: serverDownload.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Header className={cn(headerVariants({ variant: "h1", margin: "normal" }))}>
        <Icons.Users className={iconVariants({ variant: "extraLarge" })} />
        Partner Servers
      </Header>
      <p className="mb-4 text-left text-base md:text-lg">
        Manage your server's partner list. Partner servers will be displayed publicly.
      </p>

      <Block className="mt-4">
        <Header className={cn(headerVariants({ variant: "h2" }))}>
          <Icons.HandShake className={iconVariants({ variant: "large", className: "stroke-2!" })} />
          Partner Servers
        </Header>
        <p className="mb-4 text-left">
          Add, edit, or remove partner servers. Partner servers will be displayed at the public URL:
          <br />
          <code className="text-sm">/server/{serverDownload.id}/partner</code>
        </p>
        <PartnerList serverId={serverDownload.id} partners={partners} />
      </Block>
    </>
  );
}
