import React from 'react';
import { getGuildInfo, isGuildAdmin } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSession } from '@/lib/session';

import TicketDashboard from './components/TicketDashboard';
import TicketCategoryList from './components/TicketCategoryList';
import TicketStats from './components/TicketStats';

export default async function TicketsPage({ params }: { params: { server: string } }) {
  const { server } = params;
  
  // Aktuelle Session abrufen
  const session = await getSession();
  const userId = session?.id; // Session enthält die Discord-ID direkt
  
  // Guild-Daten abrufen und Berechtigungen prüfen
  const guild = await getGuildInfo(server);
  const isAdmin = await isGuildAdmin(server, userId);
  
  if (!guild || !isAdmin) redirect('/dashboard');

  // Ticket-Kategorien abrufen
  const categories = await prismaClient.ticketCategory.findMany({
    where: {
      guildId: server,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Aktive Tickets abrufen
  const activeTickets = await prismaClient.ticket.findMany({
    where: {
      guildId: server,
      open: true,
      deleted: false,
    },
    include: {
      category: true,
      createdBy: true,
      claimedBy: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/${server}`}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span>Tickets</span>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2">Ticket-System</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/${server}/tickets/all`}>
              Alle Tickets
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 pt-4">
          <TicketDashboard tickets={activeTickets} serverId={server} />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6 pt-4">
          <TicketCategoryList categories={categories} serverId={server} />
        </TabsContent>
        
        <TabsContent value="statistics" className="space-y-6 pt-4">
          <TicketStats serverId={server} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
