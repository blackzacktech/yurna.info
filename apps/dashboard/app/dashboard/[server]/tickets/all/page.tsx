import { getGuildInfo } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

import TicketTable from './components/TicketTable';
import TableSkeleton from './components/TableSkeleton';

export default async function AllTicketsPage({ 
  params,
  searchParams
}: { 
  params: { server: string }; 
  searchParams: { tab?: string; page?: string; }
}) {
  const { server } = params;
  const tab = searchParams.tab || 'active';
  const page = parseInt(searchParams.page || '1', 10);
  
  // Guild-Daten abrufen
  const guild = await getGuildInfo(server);
  if (!guild) redirect('/dashboard');

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Allgemeine Filter für alle Tickets
  const baseFilter = {
    guildId: server,
  };

  // Spezifische Filter basierend auf dem Tab
  const filter = {
    ...baseFilter,
    ...(tab === 'active' ? { open: true, deleted: false } : {}),
    ...(tab === 'closed' ? { deleted: true } : {}),
    ...(tab === 'all' ? {} : {}),
  };

  // Gesamtzahl der Tickets für die Paginierung
  const totalTickets = await prismaClient.ticket.count({
    where: filter,
  });

  // Tickets abrufen
  const tickets = await prismaClient.ticket.findMany({
    where: filter,
    include: {
      category: true,
      createdBy: true,
      claimedBy: true,
      closedBy: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: pageSize,
  });

  const totalPages = Math.ceil(totalTickets / pageSize);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/${server}`}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/${server}/tickets`}>Tickets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span>Alle Tickets</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ticket-Übersicht für {guild.name}</h1>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" asChild>
            <a href={`/dashboard/${server}/tickets/all?tab=active`}>Aktive Tickets</a>
          </TabsTrigger>
          <TabsTrigger value="closed" asChild>
            <a href={`/dashboard/${server}/tickets/all?tab=closed`}>Geschlossene Tickets</a>
          </TabsTrigger>
          <TabsTrigger value="all" asChild>
            <a href={`/dashboard/${server}/tickets/all?tab=all`}>Alle Tickets</a>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={tab} className="space-y-4">
          <Suspense fallback={<TableSkeleton />}>
            <TicketTable 
              tickets={tickets} 
              currentPage={page} 
              totalPages={totalPages} 
              serverId={server} 
              tab={tab}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
