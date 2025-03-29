import prismaClient from "@yurna/database";
import { getGuildFromMemberGuilds, getGuild } from "@yurna/util/functions/guild";
import { getSession } from "lib/session";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function PUT(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const session = await getSession();
  if (!session || !session.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server, partner } = params;
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
    // Check if partner exists and belongs to this server
    const existingPartner = await prismaClient.guildPartner.findFirst({
      where: {
        id: partner,
        guildId: serverDownload.id,
      },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const banner = formData.get("banner") as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    // If a new banner is uploaded, update the hasBanner flag
    const hasBanner = banner ? true : existingPartner.hasBanner;

    const updatedPartner = await prismaClient.guildPartner.update({
      where: {
        id: partner,
      },
      data: {
        name,
        description,
        hasBanner,
      },
    });

    if (banner) {
      // Create directories if they don't exist
      const publicDir = path.join(process.cwd(), "public");
      const serverDir = path.join(publicDir, "server", serverDownload.id);
      const partnerDir = path.join(serverDir, partner);
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      if (!fs.existsSync(serverDir)) {
        fs.mkdirSync(serverDir, { recursive: true });
      }
      
      if (!fs.existsSync(partnerDir)) {
        fs.mkdirSync(partnerDir, { recursive: true });
      }

      // Save the new banner
      const arrayBuffer = await banner.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(partnerDir, "banner.png"), buffer);
    }

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const session = await getSession();
  if (!session || !session.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server, partner } = params;
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
    // Check if partner exists and belongs to this server
    const existingPartner = await prismaClient.guildPartner.findFirst({
      where: {
        id: partner,
        guildId: serverDownload.id,
      },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Delete the partner
    await prismaClient.guildPartner.delete({
      where: {
        id: partner,
      },
    });

    // Delete banner if exists
    if (existingPartner.hasBanner) {
      const partnerDir = path.join(
        process.cwd(),
        "public",
        "server",
        serverDownload.id,
        partner
      );
      const bannerPath = path.join(partnerDir, "banner.png");
      
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
      }
      
      // Try to remove directory if empty
      try {
        fs.rmdirSync(partnerDir);
      } catch (error) {
        // Ignore if directory is not empty
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
