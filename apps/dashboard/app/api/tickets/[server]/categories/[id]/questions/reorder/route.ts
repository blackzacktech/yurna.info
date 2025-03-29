import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// Reihenfolge der Fragen ändern
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

    // Daten extrahieren
    const { questionId, direction } = await req.json();

    // Frage prüfen
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

    // Alle Fragen dieser Kategorie abrufen, sortiert nach Reihenfolge
    const questions = await prismaClient.ticketQuestion.findMany({
      where: {
        categoryId: id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Index der aktuellen Frage finden
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: 'Frage nicht in der Kategorie gefunden' },
        { status: 404 }
      );
    }

    // Zielindex berechnen
    let targetIndex;
    if (direction === 'up') {
      // Nach oben verschieben (niedrigerer Index)
      if (currentIndex === 0) {
        // Bereits ganz oben
        return NextResponse.json({
          message: 'Keine Änderung notwendig, Frage ist bereits ganz oben',
        });
      }
      targetIndex = currentIndex - 1;
    } else if (direction === 'down') {
      // Nach unten verschieben (höherer Index)
      if (currentIndex === questions.length - 1) {
        // Bereits ganz unten
        return NextResponse.json({
          message: 'Keine Änderung notwendig, Frage ist bereits ganz unten',
        });
      }
      targetIndex = currentIndex + 1;
    } else {
      return NextResponse.json(
        { error: 'Ungültige Richtung' },
        { status: 400 }
      );
    }

    // Fragen tauschen
    const targetQuestion = questions[targetIndex];
    
    // Reihenfolge aktualisieren
    await prismaClient.$transaction([
      // Temporäre Werte verwenden, um Konflikte zu vermeiden
      prismaClient.ticketQuestion.update({
        where: { id: question.id },
        data: { order: -1 }, // Temporärer Wert
      }),
      prismaClient.ticketQuestion.update({
        where: { id: targetQuestion.id },
        data: { order: question.order },
      }),
      prismaClient.ticketQuestion.update({
        where: { id: question.id },
        data: { order: targetQuestion.order },
      }),
    ]);

    // Webhook-Anfrage senden, um den Bot zu benachrichtigen
    try {
      await fetch(process.env.BOT_WEBHOOK_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'TICKET_QUESTIONS_REORDERED',
          guildId: server,
          categoryId: id,
        }),
      });
    } catch (webhookError) {
      console.error('Fehler beim Senden des Webhooks:', webhookError);
      // Fehlgeschlagenen Webhook ignorieren, Reihenfolge wurde trotzdem aktualisiert
    }

    return NextResponse.json({
      message: 'Reihenfolge erfolgreich aktualisiert',
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Reihenfolge:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Reihenfolge' },
      { status: 500 }
    );
  }
}
