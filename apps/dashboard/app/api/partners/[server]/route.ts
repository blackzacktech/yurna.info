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

// Helper function to check if user has required permission
function hasPermission(requiredPermission: string, permissions: string) {
  // Discord permission "MANAGE_GUILD" is represented by the bit 0x20 (32 in decimal)
  if (requiredPermission === "MANAGE_GUILD") {
    const permissionBit = BigInt(0x20);
    const permissionsValue = BigInt(permissions);
    return (permissionsValue & permissionBit) === permissionBit;
  }
  return false;
}

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

  // For access token handling
  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    accessToken
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

  // For access token handling
  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    accessToken
  );
  if (
    !serverMember ||
    !serverMember.permissions ||
    !hasPermission("MANAGE_GUILD", serverMember.permissions)
  ) {
    return NextResponse.json(
      { error: "You don't have permission to manage partners" },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    
    // Extract and validate required fields
    const name = formData.get("name")?.toString();
    if (!name) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    // Extract other fields
    const description = formData.get("description")?.toString() || "";
    const partnerGuildId = formData.get("partnerGuildId")?.toString() || null;
    
    // Handle notes (supports both string and JSON array)
    let notes = [];
    const notesData = formData.get("notes")?.toString();
    if (notesData) {
      try {
        notes = JSON.parse(notesData);
      } catch (e) {
        // If not valid JSON, use as a single note
        notes = [notesData];
      }
    }
    
    // Handle tags
    let tags = [];
    const tagsData = formData.get("tags")?.toString();
    if (tagsData) {
      try {
        tags = JSON.parse(tagsData);
      } catch (e) {
        console.error("Error parsing tags:", e);
        tags = [];
      }
    }
    
    // Handle publicLink
    const publicLink = formData.get("publicLink")?.toString() || "";

    // Handle file uploads
    const banner = formData.get("banner") as File;
    const posters = formData.get("posters") as File;

    // Create partner record
    const partner = await prismaClient.guildPartner.create({
      data: {
        guildId: serverDownload.id,
        name,
        description,
        hasBanner: !!banner,
        hasPosters: !!posters,
        partnerGuildId,
        notes: JSON.stringify(notes),
        tags,
        publicLink,
      },
    });

    // Save files if provided
    if (banner) {
      const buffer = Buffer.from(await banner.arrayBuffer());
      const dir = path.join(
        process.cwd(),
        "public",
        "server",
        serverDownload.id,
        partner.id
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "banner.png"), buffer);
    }

    if (posters) {
      const buffer = Buffer.from(await posters.arrayBuffer());
      const dir = path.join(
        process.cwd(),
        "public",
        "server",
        serverDownload.id,
        partner.id
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "posters.png"), buffer);
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Error creating partner", details: error },
      { status: 500 }
    );
  }
}
