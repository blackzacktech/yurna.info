import { getGuildInfo, isGuildAdmin } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import TicketDetails from './components/TicketDetails';
import TicketMessages from './components/TicketMessages';
import TicketActionButtons from './components/TicketActionButtons';

export default async function TicketDetailPage({ 
  params 
}: { 
  params: { server: string; id: string } 
}) {
  const { server, id } = params;
  
  // Guild-Daten abrufen
  const guild = await getGuildInfo(server);
  if (!guild) redirect('/dashboard');
  
  // Berechtigungen prüfen
  const isAdmin = await isGuildAdmin(null, server);
  if (!isAdmin) redirect('/dashboard');

  // Aktuellen Benutzer abrufen
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  // Ticket-Daten abrufen
  const ticket = await prismaClient.ticket.findUnique({
    where: {
      id,
      guildId: server,
    },
    include: {
      category: true,
      createdBy: true,
      claimedBy: true,
      closedBy: true,
      questions: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  // Wenn das Ticket archiviert ist, Nachrichten aus der Archiv-Tabelle abrufen
  const messages = ticket.deleted
    ? await prismaClient.archivedMessage.findMany({
        where: {
          ticketId: ticket.id,
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
    : []; // Bei aktiven Tickets keine Nachrichten anzeigen, da diese direkt im Discord-Channel sind

  // Überprüfen, ob das Ticket vom aktuellen Benutzer beansprucht wurde
  const isClaimedByCurrentUser = ticket.claimedById === session.user.id;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/${server}`}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/${server}/tickets`}>Tickets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/${server}/tickets/all`}>Alle Tickets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span>#{ticket.number}</span>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">
            Ticket #{ticket.number} {ticket.topic && `- ${ticket.topic}`}
          </h1>
        </div>
        
        <TicketActionButtons
          ticketId={id}
          serverId={server}
          isClaimed={!!ticket.claimedById}
          isOpen={ticket.open}
          isClaimedByCurrentUser={isClaimedByCurrentUser}
          currentUserId={session.user.id}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket-Details */}
        <div className="lg:col-span-1">
          <TicketDetails ticket={ticket} />
        </div>
        
        {/* Ticket-Nachrichten oder archivierter Inhalt */}
        <div className="lg:col-span-2">
          <TicketMessages 
            ticket={ticket} 
            messages={messages} 
          />
        </div>
      </div>
    </div>
  );
}
