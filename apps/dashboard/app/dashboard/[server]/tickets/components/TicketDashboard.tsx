import { FC } from 'react';
import { Ticket, TicketCategory, User } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { de } from 'date-fns/locale';
import { CalendarClock, Ticket as TicketIcon } from 'lucide-react';

interface TicketWithRelations extends Ticket {
  category: TicketCategory | null;
  createdBy: User;
  claimedBy: User | null;
}

interface TicketDashboardProps {
  tickets: TicketWithRelations[];
  serverId: string;
}

const TicketDashboard: FC<TicketDashboardProps> = ({ tickets, serverId }) => {
  return (
    <div className="space-y-6">
      {/* Aktive Tickets-Anzeige */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Tickets</CardTitle>
          <CardDescription>Aktuell offene Supportfälle</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <TicketIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>Keine aktiven Tickets vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/dashboard/${serverId}/tickets/${ticket.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        Ticket #{ticket.number}
                      </Link>
                      {ticket.category && (
                        <Badge variant="outline" className="ml-2">
                          {ticket.category.name}
                        </Badge>
                      )}
                      {ticket.claimedById && (
                        <Badge variant="secondary" className="ml-2">
                          Beansprucht
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Erstellt von {ticket.createdBy.username}
                    </span>
                    {ticket.topic && (
                      <p className="text-sm mt-1 text-muted-foreground">{ticket.topic}</p>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {format(new Date(ticket.createdAt), 'dd. MMM yyyy, HH:mm', { locale: de })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Schnellzugriff auf Funktionen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link href={`/dashboard/${serverId}/tickets/all`} className="block p-6">
            <div className="text-lg font-medium mb-2">Alle Tickets anzeigen</div>
            <p className="text-sm text-muted-foreground">
              Zugriff auf alle Tickets mit erweiterten Filtermöglichkeiten
            </p>
          </Link>
        </Card>
        
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link href={`/dashboard/${serverId}/tickets/categories`} className="block p-6">
            <div className="text-lg font-medium mb-2">Kategorien verwalten</div>
            <p className="text-sm text-muted-foreground">
              Ticket-Kategorien und zugehörige Fragen bearbeiten
            </p>
          </Link>
        </Card>
        
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <Link href="#" className="block p-6">
            <div className="text-lg font-medium mb-2">Einstellungen</div>
            <p className="text-sm text-muted-foreground">
              Ticket-System konfigurieren und anpassen
            </p>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default TicketDashboard;
