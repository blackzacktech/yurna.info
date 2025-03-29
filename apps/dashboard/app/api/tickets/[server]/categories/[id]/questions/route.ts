import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// Fragen abrufen
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

    // Kategorie prüfen
    const category = await prismaClient.ticketCategory.findUnique({
      where: {
        id,
        guildId: server,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }

    // Fragen abrufen
    const questions = await prismaClient.ticketQuestion.findMany({
      where: {
        categoryId: id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Fehler beim Abrufen der Fragen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Fragen' },
      { status: 500 }
    );
  }
}

// Frage erstellen
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

    // Kategorie prüfen
    const category = await prismaClient.ticketCategory.findUnique({
      where: {
        id,
        guildId: server,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nicht gefunden' },
        { status: 404 }
      );
    }

    // Daten extrahieren
    const { text, placeholder, required, order } = await req.json();

    // Frage erstellen
    const question = await prismaClient.ticketQuestion.create({
      data: {
        text,
        placeholder,
        required,
        order,
        category: {
          connect: {
            id,
          },
        },
      },
    });

    // Webhook-Anfrage senden, um den Bot zu benachrichtigen
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_QUESTION_CREATED',
          guildId: server,
          categoryId: id,
          questionId: question.id,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Frage wurde trotzdem erstellt
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Fehler beim Erstellen der Frage:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Frage' },
      { status: 500 }
    );
  }
}
