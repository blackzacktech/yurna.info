import prismaClient from "@yurna/database";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { server: string; partner: string } }
) {
  const { server, partner } = params;

  try {
    // Verify the partner exists in the database
    const partnerRecord = await prismaClient.guildPartner.findFirst({
      where: {
        id: partner,
        guildId: server,
      },
    });

    if (!partnerRecord) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      );
    }

    // Path to the posters
    const customPostersPath = path.join(
      process.cwd(),
      "public",
      "server",
      server,
      partner,
      "posters.png"
    );

    // Path to the default posters
    const defaultPostersPath = path.join(
      process.cwd(),
      "public",
      "server",
      "default",
      "posters.png"
    );

    // Check if custom posters exist
    let postersPath = partnerRecord.hasPosters && fs.existsSync(customPostersPath)
      ? customPostersPath
      : defaultPostersPath;
      
    // If neither exists, generate a simple colored rectangle
    if (!fs.existsSync(postersPath)) {
      // Return a simple colored image (poster style)
      const response = new NextResponse(Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0xE0, 0x00, 0x00, 0x01, 0xE0,
        0x08, 0x02, 0x00, 0x00, 0x00, 0xBC, 0x61, 0x56, 0x2C, 0x00, 0x00, 0x00,
        0x19, 0x74, 0x45, 0x58, 0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
        0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20, 0x49, 0x6D, 0x61, 0x67,
        0x65, 0x52, 0x65, 0x61, 0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00,
        0x00, 0x30, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA, 0xEC, 0xD0, 0x31, 0x01,
        0x00, 0x00, 0x0C, 0x02, 0x30, 0xC5, 0xBF, 0x34, 0x0D, 0x7E, 0xC6, 0x85,
        0x20, 0x49, 0x9D, 0xDD, 0x0E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xB4, 0x01, 0x06, 0x00, 0x7A, 0x44,
        0x01, 0x04, 0xAC, 0x7E, 0x9E, 0x95, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
        0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]));
      response.headers.set("Content-Type", "image/png");
      response.headers.set("Cache-Control", "public, max-age=3600");
      return response;
    }

    // Read the posters
    const posters = fs.readFileSync(postersPath);

    // Create response with appropriate headers
    const response = new NextResponse(posters);
    response.headers.set("Content-Type", "image/png");
    response.headers.set("Cache-Control", "public, max-age=3600");

    return response;
  } catch (error) {
    console.error("Error serving posters:", error);
    return NextResponse.json(
      { error: "Failed to serve posters" },
      { status: 500 }
    );
  }
}
