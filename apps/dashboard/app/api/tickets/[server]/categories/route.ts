import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { server: string } }
) {
  const { server } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Kategorien abrufen
    const categories = await prismaClient.ticketCategory.findMany({
      where: {
        guildId: server,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ticket-Kategorien:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Ticket-Kategorien' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { server: string } }
) {
  const { server } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Daten aus dem Request-Body extrahieren
    const {
      name,
      description,
      emoji,
      channelName,
      discordCategory,
      openingMessage,
      memberLimit,
      totalLimit,
      claiming,
      enableFeedback,
      requireTopic,
      staffRoles,
    } = await req.json();

    // Kategorie erstellen
    const category = await prismaClient.ticketCategory.create({
      data: {
        name,
        description,
        emoji,
        channelName,
        discordCategory,
        openingMessage,
        memberLimit,
        totalLimit,
        claiming,
        enableFeedback,
        requireTopic,
        staffRoles: staffRoles || [],
        guild: {
          connect: {
            guildId: server,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Fehler beim Erstellen der Ticket-Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Ticket-Kategorie' },
      { status: 500 }
    );
  }
}
