import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@yurna/database";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import authOptions from "lib/authOptions";
import { getGuild, getGuildFromMemberGuilds } from "@yurna/util/functions/guild";
import { getSession } from "lib/session";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server, partner } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    accessToken
  );
  
  // Check if user has permission to manage partners
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
    // Find the partner
    const existingPartner = await prismaClient.guildPartner.findUnique({
      where: {
        id: partner,
      },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Ensure user is editing a partner from their own server
    if (existingPartner.guildId !== serverDownload.id) {
      return NextResponse.json(
        { error: "You can only edit partners from your own server" },
        { status: 403 }
      );
    }

    // Parse form data
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

    // Update partner
    const updatedPartner = await prismaClient.guildPartner.update({
      where: {
        id: partner,
      },
      data: {
        name,
        description,
        hasBanner: banner ? true : existingPartner.hasBanner,
        hasPosters: posters ? true : existingPartner.hasPosters,
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
        partner
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
        partner
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "posters.png"), buffer);
    }

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner", details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server, partner } = params;
  const serverDownload = await getGuild(server);
  if (!serverDownload || !serverDownload.bot) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  const accessToken = session.accessToken as string;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const serverMember = await getGuildFromMemberGuilds(
    serverDownload.id,
    accessToken
  );
  
  // Check if user has permission to manage partners
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
    // Find the partner
    const existingPartner = await prismaClient.guildPartner.findUnique({
      where: {
        id: partner,
      },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Ensure user is deleting a partner from their own server
    if (existingPartner.guildId !== serverDownload.id) {
      return NextResponse.json(
        { error: "You can only delete partners from your own server" },
        { status: 403 }
      );
    }

    // Delete the partner record
    await prismaClient.guildPartner.delete({
      where: {
        id: partner,
      },
    });

    // Delete banner and poster files if they exist
    try {
      // Check both directory structures for files
      const serverDirPath = path.join(process.cwd(), "public", "server", serverDownload.id, partner);
      const uploadsDirPath = path.join(process.cwd(), "public", "uploads", "partners", serverDownload.id, partner);
      
      // Remove banner files
      if (existingPartner.hasBanner) {
        const serverBannerPath = path.join(serverDirPath, "banner.png");
        if (fs.existsSync(serverBannerPath)) {
          fs.unlinkSync(serverBannerPath);
        }
        
        const uploadsBannerPath = path.join(uploadsDirPath, "banner.png");
        if (fs.existsSync(uploadsBannerPath)) {
          fs.unlinkSync(uploadsBannerPath);
        }
      }
      
      // Remove poster files
      if (existingPartner.hasPosters) {
        const serverPosterPath = path.join(serverDirPath, "posters.png");
        if (fs.existsSync(serverPosterPath)) {
          fs.unlinkSync(serverPosterPath);
        }
        
        const uploadsPosterPath = path.join(uploadsDirPath, "posters.png");
        if (fs.existsSync(uploadsPosterPath)) {
          fs.unlinkSync(uploadsPosterPath);
        }
        
        // Check alternate poster file name
        const serverPosterAltPath = path.join(serverDirPath, "poster.png");
        if (fs.existsSync(serverPosterAltPath)) {
          fs.unlinkSync(serverPosterAltPath);
        }
        
        const uploadsPosterAltPath = path.join(uploadsDirPath, "poster.png");
        if (fs.existsSync(uploadsPosterAltPath)) {
          fs.unlinkSync(uploadsPosterAltPath);
        }
      }
      
      // Remove empty directories
      if (fs.existsSync(serverDirPath) && fs.readdirSync(serverDirPath).length === 0) {
        fs.rmdirSync(serverDirPath);
      }
      
      if (fs.existsSync(uploadsDirPath) && fs.readdirSync(uploadsDirPath).length === 0) {
        fs.rmdirSync(uploadsDirPath);
      }
    } catch (error) {
      console.error("Error deleting partner files:", error);
      // Continue execution even if file deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner", details: error },
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

    // Determine correct directory structure based on existing files
    let filePath;
    
    // First try the 'uploads/partners' directory structure
    if (type === "banner" && partner.hasBanner) {
      filePath = path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "banner.png");
      if (!fs.existsSync(filePath)) {
        // Try alternate 'server' directory structure
        filePath = path.join(process.cwd(), "public", "server", params.server, partner.id, "banner.png");
      }
    } else if ((type === "poster" || type === "posters") && partner.hasPosters) {
      // Check both "poster" and "posters" naming conventions
      filePath = path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "poster.png");
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "posters.png");
        if (!fs.existsSync(filePath)) {
          // Try alternate 'server' directory structure
          filePath = path.join(process.cwd(), "public", "server", params.server, partner.id, "poster.png");
          if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), "public", "server", params.server, partner.id, "posters.png");
          }
        }
      }
    } else {
      return new NextResponse("Image not found", { status: 404 });
    }

    if (!fs.existsSync(filePath)) {
      console.error("Image file not found at path:", filePath);
      return new NextResponse("Image file not found", { status: 404 });
    }

    console.log("Serving image from path:", filePath);
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
