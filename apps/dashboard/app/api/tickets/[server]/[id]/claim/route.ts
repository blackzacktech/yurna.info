import prismaClient from '@yurna/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// Ticket beanspruchen
export async function POST(
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

    // Aktuellen User aus der Session abrufen
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Ticket abrufen
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id,
        guildId: server,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket nicht gefunden' },
        { status: 404 }
      );
    }

    if (ticket.deleted) {
      return NextResponse.json(
        { error: 'Geschlossene Tickets können nicht beansprucht werden' },
        { status: 400 }
      );
    }

    if (ticket.claimedById) {
      return NextResponse.json(
        { error: 'Ticket ist bereits beansprucht' },
        { status: 400 }
      );
    }

    // Ticket beanspruchen
    const updatedTicket = await prismaClient.ticket.update({
      where: {
        id,
      },
      data: {
        claimedBy: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    // Webhook-Anfrage senden (optional, falls Discord-Bot benachrichtigt werden soll)
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_CLAIMED',
          guildId: server,
          ticketId: id,
          userId: session.user.id,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Ticket wurde trotzdem beansprucht
    }

    return NextResponse.json({
      message: 'Ticket erfolgreich beansprucht',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Fehler beim Beanspruchen des Tickets:', error);
    return NextResponse.json(
      { error: 'Fehler beim Beanspruchen des Tickets' },
      { status: 500 }
    );
  }
}
