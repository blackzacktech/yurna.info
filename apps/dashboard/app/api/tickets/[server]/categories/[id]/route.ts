import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { server: string; id: string } }
) {
  const { server, id } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Kategorie abrufen
    const category = await prismaClient.ticketCategory.findUnique({
      where: {
        id,
        guildId: server,
      },
      include: {
        questions: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ticket-Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Ticket-Kategorie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { server: string; id: string } }
) {
  const { server, id } = params;

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

    // Kategorie aktualisieren
    const updatedCategory = await prismaClient.ticketCategory.update({
      where: {
        id,
        guildId: server,
      },
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
      },
    });

    // Webhook-Anfrage senden, um den Bot zu benachrichtigen, dass eine Kategorie aktualisiert wurde
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_CATEGORY_UPDATED',
          guildId: server,
          categoryId: id,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Kategorie wurde trotzdem aktualisiert
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Ticket-Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Ticket-Kategorie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { server: string; id: string } }
) {
  const { server, id } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Prüfen, ob aktive Tickets mit dieser Kategorie existieren
    const activeTicketsCount = await prismaClient.ticket.count({
      where: {
        categoryId: id,
        guildId: server,
        open: true,
        deleted: false,
      },
    });

    if (activeTicketsCount > 0) {
      return NextResponse.json(
        { error: `Diese Kategorie kann nicht gelöscht werden, da noch ${activeTicketsCount} aktive Tickets damit verknüpft sind.` },
        { status: 400 }
      );
    }

    // Fragen der Kategorie löschen
    await prismaClient.ticketQuestion.deleteMany({
      where: {
        categoryId: id,
      },
    });

    // Kategorie löschen
    await prismaClient.ticketCategory.delete({
      where: {
        id,
        guildId: server,
      },
    });

    // Webhook-Anfrage senden, um den Bot zu benachrichtigen, dass eine Kategorie gelöscht wurde
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_CATEGORY_DELETED',
          guildId: server,
          categoryId: id,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Kategorie wurde trotzdem gelöscht
    }

    return NextResponse.json({
      message: 'Kategorie erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Ticket-Kategorie:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Ticket-Kategorie' },
      { status: 500 }
    );
  }
}
