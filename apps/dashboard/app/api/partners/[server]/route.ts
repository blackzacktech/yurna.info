import prismaClient from "@yurna/database";
import { getGuildFromMemberGuilds, getGuild } from "@yurna/util/functions/guild";
import { getSession } from "lib/session";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  const session = await getSession();
  if (!session || !session.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    session.access_token
  );
  if (
    !serverMember ||
    !serverMember.permissions_names ||
    !serverMember.permissions_names.includes("ManageGuild") ||
    !serverMember.permissions_names.includes("Administrator")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const partners = await prismaClient.guildPartner.findMany({
      where: {
        guildId: serverDownload.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        partnerGuild: {
          select: {
            guildId: true,
          },
        },
      },
    });
    
    // Erweitere die Partner-Daten mit Server-Statistiken für Partner, die auch Yurna nutzen
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        if (partner.partnerGuildId) {
          try {
            // Hole Mitgliederstatistiken für Partner-Gilden
            const memberStats = await prismaClient.guildMessage.findFirst({
              where: {
                guildId: partner.partnerGuildId,
              },
              orderBy: {
                date: 'desc'
              }
            });
            
            const userCount = memberStats ? memberStats.messages : 0;
            
            return {
              ...partner,
              partnerStats: {
                hasYurna: true,
                userCount,
                partnershipDays: Math.floor((Date.now() - partner.partnershipDate.getTime()) / (1000 * 60 * 60 * 24))
              }
            };
          } catch (error) {
            console.error("Error fetching partner stats:", error);
            return partner;
          }
        }
        
        return {
          ...partner,
          partnerStats: {
            hasYurna: false,
            partnershipDays: Math.floor((Date.now() - partner.partnershipDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        };
      })
    );
    
    return NextResponse.json(partnersWithStats);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  const session = await getSession();
  if (!session || !session.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    session.access_token
  );
  if (
    !serverMember ||
    !serverMember.permissions_names ||
    !serverMember.permissions_names.includes("ManageGuild") ||
    !serverMember.permissions_names.includes("Administrator")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const banner = formData.get("banner") as File | null;
    const partnerGuildId = formData.get("partnerGuildId") as string || null;
    const notes = formData.get("notes") as string || "";

    if (!name) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    // Verify partnerGuildId if provided
    if (partnerGuildId) {
      const partnerGuild = await prismaClient.guild.findUnique({
        where: {
          guildId: partnerGuildId
        }
      });
      
      if (!partnerGuild) {
        return NextResponse.json(
          { error: "Partner guild not found" },
          { status: 400 }
        );
      }
    }

    const partner = await prismaClient.guildPartner.create({
      data: {
        guildId: serverDownload.id,
        name,
        description,
        hasBanner: !!banner,
        partnerGuildId,
        notes,
      },
    });

    if (banner) {
      // Create directories if they don't exist
      const publicDir = path.join(process.cwd(), "public");
      const serverDir = path.join(publicDir, "server", serverDownload.id);
      const partnerDir = path.join(serverDir, partner.id);
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      if (!fs.existsSync(serverDir)) {
        fs.mkdirSync(serverDir, { recursive: true });
      }
      
      if (!fs.existsSync(partnerDir)) {
        fs.mkdirSync(partnerDir, { recursive: true });
      }

      // Save the banner
      const arrayBuffer = await banner.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(partnerDir, "banner.png"), buffer);
    }

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
