import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';

// GET /api/tickets/[server] - Holt Tickets für den Server
export async function GET(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  try {
    // Session abrufen
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-ID aus den Parametern holen
    const { server } = params;

    // Admin-Rechte prüfen
    const isAdmin = await isGuildAdmin(server, session.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // URL-Parameter auslesen
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    const search = url.searchParams.get('search');

    // Filter aufbauen
    const filter: any = {
      guildId: server,
      deleted: false,
    };

    // Status-Filter
    if (status === 'open') {
      filter.open = true;
    } else if (status === 'closed') {
      filter.open = false;
    }

    // Kategorie-Filter
    if (category) {
      filter.categoryId = parseInt(category);
    }

    // Prioritäts-Filter
    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    // Suche
    if (search) {
      filter.OR = [
        { id: { contains: search } },
        { topic: { contains: search } },
        { createdBy: { username: { contains: search } } },
        { createdBy: { discriminator: { contains: search } } },
      ];
    }

    // Gesamtanzahl der passenden Tickets ermitteln
    const total = await prismaClient.ticket.count({ where: filter });

    // Tickets abfragen
    const tickets = await prismaClient.ticket.findMany({
      where: filter,
      include: {
        category: true,
        createdBy: true,
        claimedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets/[server] - Erstellt ein neues Ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { server: string } }
) {
  try {
    // Session abrufen
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-ID aus den Parametern holen
    const { server } = params;

    // Admin-Rechte prüfen
    const isAdmin = await isGuildAdmin(server, session.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Daten aus dem Request-Body holen
    const data = await request.json();
    const { categoryId, topic, userId } = data;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Kategorie prüfen
    const category = await prismaClient.ticketCategory.findUnique({
      where: {
        id: categoryId,
        guildId: server,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Ticket über den Bot erstellen
    // Hier würden wir normalerweise den Bot über Redis informieren
    // Da das eine komplexe Implementierung wäre, erstellen wir das Ticket direkt

    // Höchste Ticket-Nummer ermitteln
    const highestTicket = await prismaClient.ticket.findFirst({
      where: { guildId: server },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const number = (highestTicket?.number || 0) + 1;

    // Ticket erstellen
    const ticket = await prismaClient.ticket.create({
      data: {
        id: `${server}-${number}`,
        number,
        guildId: server,
        categoryId,
        createdById: userId || session.id,
        topic: topic || null,
        open: true,
        openingMessageId: '0', // Wird später vom Bot aktualisiert
      },
    });

    return NextResponse.json({
      success: true,
      ticket,
      message:
        'Ticket wurde erstellt. Der Bot wird den Discord-Kanal in Kürze einrichten.',
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
