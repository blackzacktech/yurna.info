import { FC } from 'react';
import { Ticket, TicketCategory, User, TicketQuestionAnswer } from '@prisma/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, CheckCircle, MessageCircle, Tag, User as UserIcon, XCircle } from 'lucide-react';
import TicketStatusBadge from './TicketStatusBadge';

interface TicketWithRelations extends Ticket {
  category: TicketCategory | null;
  createdBy: User;
  claimedBy: User | null;
  questions: (TicketQuestionAnswer & {
    question: {
      id: string;
      text: string;
    };
  })[];
}

interface TicketDetailsProps {
  ticket: TicketWithRelations;
}

const TicketDetails: FC<TicketDetailsProps> = ({ ticket }) => {
  // Status des Tickets bestimmen
  const getTicketStatus = () => {
    if (ticket.deleted) return 'deleted';
    if (ticket.claimedById) return 'claimed';
    if (ticket.open) return 'open';
    return 'closed';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket-Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <TicketStatusBadge status={getTicketStatus()} />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Kategorie</span>
            <div className="flex items-center">
              {ticket.category ? (
                <>
                  <span className="mr-2">{ticket.category.emoji}</span>
                  <span>{ticket.category.name}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Keine Kategorie</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Ticket-ID</span>
            <span>#{ticket.number}</span>
          </div>

          {ticket.ticketChannelId && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Channel-ID</span>
              <span className="font-mono text-xs">{ticket.ticketChannelId}</span>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-start gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-sm font-medium">Erstellt von</span>
              <p>{ticket.createdBy.username}</p>
            </div>
          </div>
          
          {ticket.claimedById && (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-sm font-medium">Beansprucht von</span>
                <p>{ticket.claimedBy?.username}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-sm font-medium">Erstellt am</span>
              <p>{format(new Date(ticket.createdAt), 'dd. MMMM yyyy, HH:mm', { locale: de })}</p>
            </div>
          </div>
          
          {ticket.deleted && ticket.closedAt && (
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-sm font-medium">Geschlossen am</span>
                <p>{format(new Date(ticket.closedAt), 'dd. MMMM yyyy, HH:mm', { locale: de })}</p>
              </div>
            </div>
          )}
          
          {ticket.topic && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-sm font-medium">Thema</span>
                <p>{ticket.topic}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Ticket-Fragen und Antworten */}
        {ticket.questions && ticket.questions.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h3 className="text-sm font-medium">Ticket-Fragen</h3>
            <div className="space-y-3">
              {ticket.questions.map((qa) => (
                <div key={qa.id} className="space-y-1">
                  <p className="text-sm font-medium">{qa.question.text}</p>
                  <p className="text-sm text-muted-foreground">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDetails;
