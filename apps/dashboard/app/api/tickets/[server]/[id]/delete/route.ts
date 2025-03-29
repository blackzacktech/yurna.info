import prismaClient from '@yurna/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { server: string; id: string } }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthentifiziert' }, { status: 401 });
    }

    const { server, id } = params;

    // Berechtigungen überprüfen
    const isAdmin = await isGuildAdmin(session, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Ticket finden
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

    // Überprüfen, ob das Ticket bereits gelöscht wurde
    if (ticket.deleted) {
      return NextResponse.json(
        { error: 'Ticket wurde bereits gelöscht' },
        { status: 400 }
      );
    }

    // Ticket als gelöscht markieren
    const updatedTicket = await prismaClient.ticket.update({
      where: {
        id,
      },
      data: {
        deleted: true,
        open: false, // Geschlossen setzen, wenn es noch nicht geschlossen war
        deletedById: session.user.id,
        deletedAt: new Date(),
      },
    });

    // Webhook-Benachrichtigung senden (falls konfiguriert)
    try {
      if (process.env.BOT_WEBHOOK_URL) {
        await fetch(process.env.BOT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'TICKET_DELETED',
            data: {
              ticketId: ticket.id,
              ticketNumber: ticket.number,
              guildId: server,
              deletedBy: {
                id: session.user.id,
                username: session.user.name,
              },
            },
          }),
        });
      }
    } catch (webhookError) {
      console.error('Fehler beim Senden der Webhook-Benachrichtigung:', webhookError);
      // Wir geben keinen Fehler zurück, da das Löschen trotzdem erfolgreich war
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Tickets:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
