import prismaClient from '@yurna/database';
import { isGuildAdmin } from '@yurna/util/functions/guild';
import { NextRequest, NextResponse } from 'next/server';

// API-Route für Ticket-Statistiken
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

    // Zeitraum für Statistiken (letzte 30 Tage)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Gesamtzahl aller Tickets
    const totalTickets = await prismaClient.ticket.count({
      where: {
        guildId: server,
      },
    });

    // Anzahl der aktiven Tickets
    const activeTickets = await prismaClient.ticket.count({
      where: {
        guildId: server,
        open: true,
        deleted: false,
      },
    });

    // Anzahl der geschlossenen Tickets
    const closedTickets = await prismaClient.ticket.count({
      where: {
        guildId: server,
        deleted: true,
      },
    });

    // Anzahl der Tickets pro Kategorie
    const ticketsByCategory = await prismaClient.ticketCategory.findMany({
      where: {
        guildId: server,
      },
      select: {
        id: true,
        name: true,
        emoji: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        tickets: {
          _count: 'desc',
        },
      },
    });

    // Tickets pro Tag in den letzten 30 Tagen
    const ticketsPerDay = await prismaClient.ticket.groupBy({
      by: ['createdAt'],
      where: {
        guildId: server,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Durchschnittliche Bearbeitungszeit (Zeit zwischen Erstellung und Schließung)
    const closedTicketsWithDuration = await prismaClient.ticket.findMany({
      where: {
        guildId: server,
        deleted: true,
        closedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });

    let totalDuration = 0;
    let ticketCount = closedTicketsWithDuration.length;

    closedTicketsWithDuration.forEach((ticket) => {
      if (ticket.closedAt) {
        const duration = ticket.closedAt.getTime() - ticket.createdAt.getTime();
        totalDuration += duration;
      }
    });

    const averageResolutionTime = ticketCount > 0 
      ? Math.floor(totalDuration / ticketCount / (1000 * 60 * 60)) // In Stunden
      : 0;

    // Bereite die Daten für die täglichen Tickets auf
    const days: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      days[dateKey] = 0;
    }

    ticketsPerDay.forEach((day) => {
      const dateKey = day.createdAt.toISOString().split('T')[0];
      if (days[dateKey] !== undefined) {
        days[dateKey] = day._count.id;
      }
    });

    const dailyTicketData = Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .reverse();

    // Top Staff (Mitarbeiter mit den meisten bearbeiteten Tickets)
    const topStaff = await prismaClient.ticket.groupBy({
      by: ['claimedById'],
      where: {
        guildId: server,
        claimedById: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Benutzerinformationen für Top-Staff abrufen
    const staffIds = topStaff.map(staff => staff.claimedById).filter(Boolean) as string[];
    const staffUsers = await prismaClient.user.findMany({
      where: {
        id: {
          in: staffIds,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    // Daten kombinieren
    const topStaffWithUserInfo = topStaff.map(staff => {
      const user = staffUsers.find(user => user.id === staff.claimedById);
      return {
        userId: staff.claimedById,
        username: user?.username || 'Unbekannter Nutzer',
        avatarUrl: user?.avatarUrl || null,
        ticketCount: staff._count.id,
      };
    });

    return NextResponse.json({
      totalTickets,
      activeTickets,
      closedTickets,
      ticketsByCategory,
      dailyTicketData,
      averageResolutionTime,
      topStaff: topStaffWithUserInfo,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Ticket-Statistiken:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Statistiken' },
      { status: 500 }
    );
  }
}
