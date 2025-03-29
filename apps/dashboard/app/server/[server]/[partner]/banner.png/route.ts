import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prismaClient from "@yurna/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  try {
    const partner = await prismaClient.guildPartner.findUnique({
      where: {
        id: params.partner,
      },
    });

    if (!partner) {
      console.error("Partner not found:", params.partner);
      return new NextResponse("Partner not found", { status: 404 });
    }

    if (!partner.hasBanner) {
      return new NextResponse("Partner has no banner", { status: 404 });
    }

    // Determine correct directory structure based on existing files
    let filePath = null;
    const possiblePaths = [];
    
    // All possible file paths to check for banner
    // Uploads directory paths
    possiblePaths.push(path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "banner.png"));
    // Server directory paths
    possiblePaths.push(path.join(process.cwd(), "public", "server", params.server, partner.id, "banner.png"));
    
    // Check all possible paths
    for (const pathToCheck of possiblePaths) {
      console.log("Checking banner path:", pathToCheck);
      if (fs.existsSync(pathToCheck)) {
        filePath = pathToCheck;
        console.log("Found banner image at:", filePath);
        break;
      }
    }

    if (!filePath) {
      console.error("Banner image file not found in any of these paths:", possiblePaths);
      return new NextResponse("Banner image file not found", { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    console.log("Successfully read banner buffer of size:", imageBuffer.length);
    
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    console.error("Error serving banner image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
