import { FC, useState } from 'react';
import { Ticket, TicketCategory, User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Trash, XCircle, UserCheck, RefreshCw, DownloadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface TicketWithRelations extends Ticket {
  category: TicketCategory | null;
  createdBy: User;
  claimedBy: User | null;
}

interface TicketActionsProps {
  ticket: TicketWithRelations;
  serverId: string;
}

const TicketActions: FC<TicketActionsProps> = ({ ticket, serverId }) => {
  const router = useRouter();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ticket beanspruchen
  const handleClaimTicket = async () => {
    if (ticket.claimedById || ticket.deleted) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticket.id}/claim`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Beanspruchen des Tickets');
      }

      toast({
        title: 'Ticket beansprucht',
        description: 'Das Ticket wurde erfolgreich beansprucht.',
      });

      router.refresh();
    } catch (error) {
      console.error('Fehler beim Beanspruchen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ticket schließen
  const handleCloseTicket = async () => {
    if (ticket.deleted) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticket.id}/close`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Schließen des Tickets');
      }

      toast({
        title: 'Ticket geschlossen',
        description: 'Das Ticket wurde erfolgreich geschlossen.',
      });

      setIsCloseDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Schließen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ticket löschen
  const handleDeleteTicket = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticket.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Löschen des Tickets');
      }

      toast({
        title: 'Ticket gelöscht',
        description: 'Das Ticket wurde erfolgreich gelöscht.',
      });

      setIsDeleteDialogOpen(false);
      router.push(`/dashboard/${serverId}/tickets`);
    } catch (error) {
      console.error('Fehler beim Löschen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ticket Transcript herunterladen
  const handleDownloadTranscript = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticket.id}/transcript`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Herunterladen des Transcripts');
      }

      // Transcript als Blob herunterladen
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.number}-transcript.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: 'Transcript heruntergeladen',
        description: 'Das Ticket-Transcript wurde erfolgreich heruntergeladen.',
      });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Transcripts:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Primäre Aktion basierend auf Ticket-Status */}
        {!ticket.deleted ? (
          <Button 
            variant="destructive" 
            onClick={() => setIsCloseDialogOpen(true)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Ticket schließen
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleDownloadTranscript}
            disabled={isLoading}
          >
            <DownloadCloud className="h-4 w-4 mr-2" />
            Transcript
          </Button>
        )}

        {/* Dropdown für weitere Aktionen */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              Aktionen
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!ticket.deleted && !ticket.claimedById && (
              <DropdownMenuItem onClick={handleClaimTicket}>
                <UserCheck className="h-4 w-4 mr-2" />
                Ticket beanspruchen
              </DropdownMenuItem>
            )}
            
            {!ticket.deleted && (
              <DropdownMenuItem onClick={handleDownloadTranscript}>
                <DownloadCloud className="h-4 w-4 mr-2" />
                Transcript herunterladen
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Ticket löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog zur Bestätigung des Ticket-Schließens */}
      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket schließen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du dieses Ticket wirklich schließen? Der Ticket-Channel wird archiviert und für den Nutzer nicht mehr zugänglich sein.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseTicket} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Wird geschlossen...
                </>
              ) : (
                'Ticket schließen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog zur Bestätigung des Ticket-Löschens */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du dieses Ticket wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden und alle Daten werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTicket} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                'Ticket löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TicketActions;
