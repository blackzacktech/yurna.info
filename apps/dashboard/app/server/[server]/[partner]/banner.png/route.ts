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

    // Path to the banner
    const customBannerPath = path.join(
      process.cwd(),
      "public",
      "server",
      server,
      partner,
      "banner.png"
    );

    // Path to the default banner
    const defaultBannerPath = path.join(
      process.cwd(),
      "public",
      "images",
      "default-partner-banner.png"
    );

    // Check if custom banner exists
    const bannerPath = partnerRecord.hasBanner && fs.existsSync(customBannerPath)
      ? customBannerPath
      : defaultBannerPath;

    if (!fs.existsSync(bannerPath)) {
      return NextResponse.json(
        { error: "Banner not found" },
        { status: 404 }
      );
    }

    // Read the banner
    const banner = fs.readFileSync(bannerPath);

    // Create response with appropriate headers
    const response = new NextResponse(banner);
    response.headers.set("Content-Type", "image/png");
    response.headers.set("Cache-Control", "public, max-age=3600");

    return response;
  } catch (error) {
    console.error("Error serving banner:", error);
    return NextResponse.json(
      { error: "Failed to serve banner" },
      { status: 500 }
    );
  }
}
