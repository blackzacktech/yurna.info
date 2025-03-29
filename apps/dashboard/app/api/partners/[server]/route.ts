import prismaClient from "@yurna/database";
import { getGuildFromMemberGuilds, getGuild } from "@yurna/util/functions/guild";
import { getServerSession } from "next-auth";
import authOptions from "lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define the GuildPartner type
type GuildPartner = {
  id: string;
  guildId: string;
  name: string;
  description: string | null;
  hasBanner: boolean;
  hasPosters: boolean;
  partnerGuildId: string | null;
  partnershipDate: Date;
  notes: string | null;
  tags: string[];
  publicLink: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    session.accessToken
  );
  if (
    !serverMember ||
    !serverMember.permissions_names ||
    !serverMember.permissions_names.includes("ManageGuild") ||
    !serverMember.permissions_names.includes("Administrator")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get partners with additional information about the partner guild if available
  const partners = await prismaClient.guildPartner.findMany({
    where: {
      guildId: serverDownload.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      partnerGuild: {
        select: {
          guildId: true,
          name: true,
          memberCount: true,
          createdAt: true,
          icon: true
        }
      }
    }
  });

  return NextResponse.json(partners);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    session.accessToken
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
    const posters = formData.get("posters") as File | null;
    const partnerGuildId = formData.get("partnerGuildId") ? (formData.get("partnerGuildId") as string) : null;
    const notes = formData.get("notes") ? (formData.get("notes") as string) : "";
    const tags = formData.get("tags") as string;
    const publicLink = formData.get("publicLink") as string;

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
        hasPosters: !!posters,
        partnerGuildId,
        notes,
        tags: tags ? JSON.parse(tags) : [],
        publicLink: publicLink || null,
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

    if (posters) {
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

      // Save the poster
      const arrayBuffer = await posters.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(partnerDir, "posters.png"), buffer);
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
