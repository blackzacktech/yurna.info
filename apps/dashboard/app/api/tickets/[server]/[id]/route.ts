import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// Ticket-Details abrufen
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

    // Ticket abrufen
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id,
        guildId: server,
      },
      include: {
        category: true,
        createdBy: true,
        claimedBy: true,
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Fehler beim Abrufen des Tickets:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Tickets' },
      { status: 500 }
    );
  }
}

// Ticket löschen
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

    // Ticket löschen
    await prismaClient.ticket.delete({
      where: {
        id,
        guildId: server,
      },
    });

    return NextResponse.json(
      { message: 'Ticket erfolgreich gelöscht' }
    );
  } catch (error) {
    console.error('Fehler beim Löschen des Tickets:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Tickets' },
      { status: 500 }
    );
  }
}
