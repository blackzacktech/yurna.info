import React from 'react';
import { getGuildInfo, isGuildAdmin } from '@yurna/util/functions/guild';
import { redirect } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';
import { getSession } from '@/lib/session';
import prismaClient from '@yurna/database';

import TicketSettingsForm from './components/TicketSettingsForm';
import TicketMessageSettings from './components/TicketMessageSettings';
import TicketDisplaySettings from './components/TicketDisplaySettings';

export default async function TicketSettingsPage({ params }: { params: { server: string } }) {
  const { server } = params;
  
  // Aktuelle Session abrufen
  const session = await getSession();
  const userId = session?.id;
  
  try {
    // Guild-Daten abrufen und Berechtigungen prüfen
    const guild = await getGuildInfo(server);
    
    if (!guild) {
      console.error("Guild information not found for", server);
      redirect('/dashboard');
    }
    
    const isAdmin = await isGuildAdmin(server, userId);
    
    if (!isAdmin) {
      console.error("User is not an admin for this guild", userId, server);
      redirect('/dashboard');
    }

    // Ticket-Einstellungen abrufen oder Standardwerte verwenden
    const ticketSettings = await prismaClient.guildSettings.findUnique({
      where: {
        guildId: server,
      },
      select: {
        ticketSettings: true,
      },
    });

    // Ticket-Kategorien für die Auswahl der Kategorien in der Eröffnungsnachricht
    const categories = await prismaClient.ticketCategory.findMany({
      where: {
        guildId: server,
      },
      orderBy: {
        name: 'asc',
      },
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
                <BreadcrumbLink href={`/dashboard/${server}/tickets`}>Tickets</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <span>Einstellungen</span>
              </BreadcrumbItem>
            </Breadcrumb>
            <h1 className="text-2xl font-bold mt-2">Ticket-Einstellungen</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allgemeine Ticket-Einstellungen */}
          <TicketSettingsForm 
            serverId={server}
            initialSettings={ticketSettings?.ticketSettings}
          />
          
          {/* Ticket-Eröffnungsnachricht Einstellungen */}
          <TicketMessageSettings 
            serverId={server}
            categories={categories}
            initialSettings={ticketSettings?.ticketSettings}
          />
        </div>

        {/* Display-Einstellungen für Buttons und UI */}
        <TicketDisplaySettings 
          serverId={server}
          categories={categories}
          initialSettings={ticketSettings?.ticketSettings}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in TicketSettingsPage:", error);
    redirect('/dashboard');
  }
}
