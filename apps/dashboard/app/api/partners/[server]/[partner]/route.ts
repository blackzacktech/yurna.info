import prismaClient from "@yurna/database";
import { getGuildFromMemberGuilds, getGuild } from "@yurna/util/functions/guild";
import { getSession } from "lib/session";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import authOptions from "lib/authOptions";

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
    const posters = formData.get("posters") as File | null;
    const partnerGuildId = formData.get("partnerGuildId") as string || null;
    const notes = formData.get("notes") as string || "";

    if (!name) {
      return NextResponse.json(
        { error: "Partner name is required" },
        { status: 400 }
      );
    }

    // If a new banner is uploaded, update the hasBanner flag
    const hasBanner = banner ? true : existingPartner.hasBanner;
    // If new posters are uploaded, update the hasPosters flag
    const hasPosters = posters ? true : existingPartner.hasPosters;

    // Verify partnerGuildId if provided
    if (partnerGuildId && partnerGuildId !== existingPartner.partnerGuildId) {
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

    const updatedPartner = await prismaClient.guildPartner.update({
      where: {
        id: partner,
      },
      data: {
        name,
        description,
        hasBanner,
        hasPosters,
        partnerGuildId,
        notes,
      },
    });

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

    if (banner) {
      // Lösche altes Banner, falls vorhanden
      const bannerPath = path.join(partnerDir, "banner.png");
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
      }

      // Speichere das neue Banner
      const arrayBuffer = await banner.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(partnerDir, "banner.png"), buffer);
    }

    if (posters) {
      // Lösche alte Werbeplakate, falls vorhanden
      const postersPath = path.join(partnerDir, "posters.png");
      if (fs.existsSync(postersPath)) {
        fs.unlinkSync(postersPath);
      }

      // Speichere die neuen Werbeplakate
      const arrayBuffer = await posters.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(partnerDir, "posters.png"), buffer);
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

    // Pfad zum Partner-Verzeichnis
    const partnerDir = path.join(
      process.cwd(),
      "public",
      "server",
      serverDownload.id,
      partner
    );

    // Lösche Banner, falls vorhanden
    if (existingPartner.hasBanner) {
      const bannerPath = path.join(partnerDir, "banner.png");
      
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
      }
    }
    
    // Lösche Werbeplakate, falls vorhanden
    if (existingPartner.hasPosters) {
      const postersPath = path.join(partnerDir, "posters.png");
      
      if (fs.existsSync(postersPath)) {
        fs.unlinkSync(postersPath);
      }
    }
    
    // Versuche, das Verzeichnis zu löschen, wenn es leer ist
    try {
      fs.rmdirSync(partnerDir);
    } catch (error) {
      // Ignoriere Fehler, wenn das Verzeichnis nicht leer ist
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

export async function GET(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "banner";
  
  try {
    const partner = await prismaClient.guildPartner.findUnique({
      where: {
        id: params.partner,
      },
    });

    if (!partner) {
      return new NextResponse("Partner not found", { status: 404 });
    }

    let filePath;
    if (type === "banner" && partner.hasBanner) {
      filePath = path.join(process.cwd(), "public", "server", params.server, partner.id, "banner.png");
    } else if (type === "poster" && partner.hasPosters) {
      filePath = path.join(process.cwd(), "public", "server", params.server, partner.id, "posters.png");
    } else {
      return new NextResponse("Image not found", { status: 404 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    console.error("Error serving partner image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
