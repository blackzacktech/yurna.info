import { FC } from 'react';
import { Ticket, ArchivedMessage, ArchivedUser } from '@prisma/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface TicketMessagesProps {
  ticket: Ticket;
  messages: (ArchivedMessage & {
    author: ArchivedUser;
  })[];
}

const TicketMessages: FC<TicketMessagesProps> = ({ ticket, messages }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Ticket-Nachrichten</CardTitle>
          {ticket.ticketChannelId && !ticket.deleted && (
            <Link
              href={`https://discord.com/channels/${ticket.guildId}/${ticket.ticketChannelId}`}
              target="_blank"
              className="text-sm underline"
            >
              Im Discord öffnen
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {ticket.deleted ? (
          messages.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    {message.author.avatarUrl ? (
                      <AvatarImage src={message.author.avatarUrl} alt={message.author.username} />
                    ) : null}
                    <AvatarFallback>
                      {message.author.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.author.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                      {message.author.isBot && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-1.5 py-0.5 rounded">
                          BOT
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs text-muted-foreground mb-1">Anhänge:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline"
                            >
                              {attachment.name || `Anhang ${index + 1}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">Keine Nachrichten gefunden</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Für dieses Ticket wurden keine archivierten Nachrichten gefunden. 
                Dies kann passieren, wenn das Ticket sehr alt ist oder die Archivierung fehlgeschlagen ist.
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">Nachrichten sind im Discord-Channel verfügbar</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Nachrichten für aktive Tickets können direkt im Discord-Channel eingesehen werden.
              {ticket.ticketChannelId && (
                <>
                  {' '}
                  <Link
                    href={`https://discord.com/channels/${ticket.guildId}/${ticket.ticketChannelId}`}
                    target="_blank"
                    className="underline"
                  >
                    Zum Discord-Channel
                  </Link>
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketMessages;
