import { notFound } from "next/navigation";
import prismaClient from "@yurna/database";
import { getGuild } from "@yurna/util/functions/guild";
import { Block } from "@/components/ui/Block";
import Header, { headerVariants } from "@/components/ui/Headers";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Icons, iconVariants } from "@/components/ui/Icons";

export default async function Page({ params }: { params: { server: string } }) {
  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) return notFound();

  const guild = await prismaClient.guild.findUnique({
    where: {
      guildId: serverDownload.id,
    },
  });

  if (!guild) return notFound();

  const partners = await prismaClient.guildPartner.findMany({
    where: {
      guildId: serverDownload.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Header className={cn(headerVariants({ variant: "h1", margin: "normal" }))}>
        <Icons.HandShake className={iconVariants({ variant: "extraLarge" })} />
        Partner Servers of {serverDownload.name}
      </Header>

      {partners.length === 0 ? (
        <p className="mt-4 text-center text-neutral-400">This server has no partners listed.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <Block key={partner.id} className="flex flex-col">
              <div className="relative aspect-[2/1] w-full overflow-hidden rounded-t-lg">
                <Image
                  src={`/server/${serverDownload.id}/${partner.id}/banner.png`}
                  alt={`${partner.name} banner`}
                  width={600}
                  height={300}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <h3 className="mb-2 text-xl font-semibold">{partner.name}</h3>
                {partner.description && (
                  <p className="text-neutral-300">{partner.description}</p>
                )}
              </div>
            </Block>
          ))}
        </div>
      )}
    </div>
  );
}
