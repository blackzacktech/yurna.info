import { notFound } from "next/navigation";
import prismaClient from "@yurna/database";
import { getGuild } from "@yurna/util/functions/guild";
import { Block } from "@/components/ui/Block";
import Header, { headerVariants } from "@/components/ui/Headers";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons, iconVariants } from "@/components/ui/Icons";
import Link from "next/link";

// Partner-Typ-Definition basierend auf der Prisma-Struktur
interface Partner {
  id: string;
  name: string;
  description?: string | null;
  publicLink?: string | null;
  guildId: string;
  hasBanner: boolean;
  hasPosters: boolean;
  tags: string[];
}

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

  // Um zu verhindern, dass der Browser die Bilder aus dem Cache lädt
  const timestamp = Date.now();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <Header className={cn(headerVariants({ variant: "h1", margin: "normal" }))}>
        <Icons.HandShake className={iconVariants({ variant: "extraLarge" })} />
        Partner von {serverDownload.name}
      </Header>

      <div className="mb-8 mt-4 text-center">
        <p className="text-lg text-neutral-300">
          Entdecken Sie die Server, mit denen {serverDownload.name} zusammenarbeitet.
        </p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href={`/server/${server}`} className="flex items-center gap-2">
              <Icons.ArrowLeft className="h-4 w-4" />
              <span>Zurück zum Server</span>
            </Link>
          </Button>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="mt-8 rounded-lg bg-neutral-800/50 p-8 text-center">
          <Icons.Info className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
          <p className="text-lg text-neutral-400">Dieser Server hat noch keine Partner eingetragen.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner: Partner) => (
            <Block key={partner.id} className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Partner Banner */}
              {partner.hasBanner && (
                <div className="relative aspect-[2/1] w-full overflow-hidden">
                  <Image
                    src={`/server/${serverDownload.id}/${partner.id}/banner.png?timestamp=${timestamp}`}
                    alt={`${partner.name} Banner`}
                    width={600}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              
              {/* Partner Poster (wird angezeigt, wenn kein Banner vorhanden ist) */}
              {!partner.hasBanner && partner.hasPosters && (
                <div className="relative aspect-[2/1] w-full overflow-hidden">
                  <Image
                    src={`/server/${serverDownload.id}/${partner.id}/poster.png?timestamp=${timestamp}`}
                    alt={`${partner.name} Poster`}
                    width={600}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              
              {/* Wenn weder Banner noch Poster vorhanden sind, zeige einen Fallback */}
              {!partner.hasBanner && !partner.hasPosters && (
                <div className="flex aspect-[2/1] w-full items-center justify-center bg-gradient-to-r from-neutral-800 to-neutral-700">
                  <Icons.Image className="h-16 w-16 text-neutral-500" />
                </div>
              )}
              
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-xl font-semibold">{partner.name}</h3>
                
                {partner.description && (
                  <p className="mb-3 text-neutral-300">{partner.description}</p>
                )}
                
                {/* Tags */}
                {partner.tags && partner.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {partner.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="rounded-full bg-neutral-700/50 px-3 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Join Button wenn publicLink vorhanden ist */}
                {partner.publicLink && (
                  <div className="mt-auto pt-3">
                    <Button variant="secondary" asChild size="sm" className="w-full">
                      <a href={partner.publicLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <Icons.discord className="h-4 w-4" />
                        <span>Server beitreten</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </Block>
          ))}
        </div>
      )}
    </div>
  );
}
