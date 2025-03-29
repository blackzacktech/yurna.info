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

    if (!partner.hasPosters) {
      return new NextResponse("Partner has no poster", { status: 404 });
    }

    // Determine correct directory structure based on existing files
    let filePath = null;
    const possiblePaths = [];
    
    // All possible file paths to check for poster
    // Uploads directory paths (both naming conventions)
    possiblePaths.push(path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "poster.png"));
    possiblePaths.push(path.join(process.cwd(), "public", "uploads", "partners", params.server, partner.id, "posters.png"));
    // Server directory paths (both naming conventions)
    possiblePaths.push(path.join(process.cwd(), "public", "server", params.server, partner.id, "poster.png"));
    possiblePaths.push(path.join(process.cwd(), "public", "server", params.server, partner.id, "posters.png"));
    
    // Check all possible paths
    for (const pathToCheck of possiblePaths) {
      console.log("Checking poster path:", pathToCheck);
      if (fs.existsSync(pathToCheck)) {
        filePath = pathToCheck;
        console.log("Found poster image at:", filePath);
        break;
      }
    }

    if (!filePath) {
      console.error("Poster image file not found in any of these paths:", possiblePaths);
      return new NextResponse("Poster image file not found", { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    console.log("Successfully read poster buffer of size:", imageBuffer.length);
    
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (error) {
    console.error("Error serving poster image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
