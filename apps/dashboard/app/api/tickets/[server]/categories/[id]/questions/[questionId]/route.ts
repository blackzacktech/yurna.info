import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// Frage abrufen
export async function GET(
  req: NextRequest,
  { params }: { params: { server: string; id: string; questionId: string } }
) {
  const { server, id, questionId } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Frage abrufen
    const question = await prismaClient.ticketQuestion.findUnique({
      where: {
        id: questionId,
        categoryId: id,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Frage nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Fehler beim Abrufen der Frage:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Frage' },
      { status: 500 }
    );
  }
}

// Frage aktualisieren
export async function PUT(
  req: NextRequest,
  { params }: { params: { server: string; id: string; questionId: string } }
) {
  const { server, id, questionId } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Frage prüfen
    const existingQuestion = await prismaClient.ticketQuestion.findUnique({
      where: {
        id: questionId,
        categoryId: id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Frage nicht gefunden' },
        { status: 404 }
      );
    }

    // Daten extrahieren
    const { text, placeholder, required } = await req.json();

    // Frage aktualisieren
    const updatedQuestion = await prismaClient.ticketQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        text,
        placeholder,
        required,
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
          type: 'TICKET_QUESTION_UPDATED',
          guildId: server,
          categoryId: id,
          questionId: questionId,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Frage wurde trotzdem aktualisiert
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Frage:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Frage' },
      { status: 500 }
    );
  }
}

// Frage löschen
export async function DELETE(
  req: NextRequest,
  { params }: { params: { server: string; id: string; questionId: string } }
) {
  const { server, id, questionId } = params;

  try {
    // Berechtigungen prüfen
    const isAdmin = await isGuildAdmin(req, server);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // Frage prüfen
    const existingQuestion = await prismaClient.ticketQuestion.findUnique({
      where: {
        id: questionId,
        categoryId: id,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Frage nicht gefunden' },
        { status: 404 }
      );
    }

    // Frage löschen
    await prismaClient.ticketQuestion.delete({
      where: {
        id: questionId,
      },
    });

    // Reihenfolge der verbleibenden Fragen aktualisieren
    const remainingQuestions = await prismaClient.ticketQuestion.findMany({
      where: {
        categoryId: id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Reihenfolge neu nummerieren
    for (let i = 0; i < remainingQuestions.length; i++) {
      await prismaClient.ticketQuestion.update({
        where: {
          id: remainingQuestions[i].id,
        },
        data: {
          order: i,
        },
      });
    }

    // Webhook-Anfrage senden, um den Bot zu benachrichtigen
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_QUESTION_DELETED',
          guildId: server,
          categoryId: id,
          questionId: questionId,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Frage wurde trotzdem gelöscht
    }

    return NextResponse.json({
      message: 'Frage erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Frage:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Frage' },
      { status: 500 }
    );
  }
}
