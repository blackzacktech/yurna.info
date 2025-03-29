import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Tag, 
  Archive, 
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface TicketActionButtonsProps {
  ticketId: string;
  serverId: string;
  isClaimed: boolean;
  isOpen: boolean;
  isClaimedByCurrentUser: boolean;
  currentUserId: string;
}

const TicketActionButtons: React.FC<TicketActionButtonsProps> = ({
  ticketId,
  serverId,
  isClaimed,
  isOpen,
  isClaimedByCurrentUser,
  currentUserId,
}) => {
  const router = useRouter();
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ticket beanspruchen
  const handleClaimTicket = async () => {
    if (isClaimed) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticketId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Beanspruchen des Tickets');
      }

      toast({
        title: 'Ticket beansprucht',
        description: 'Das Ticket wurde erfolgreich von dir beansprucht.',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Beanspruchen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: 'Das Ticket konnte nicht beansprucht werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsClaimDialogOpen(false);
    }
  };

  // Ticket-Beanspruchung aufheben
  const handleUnclaimTicket = async () => {
    if (!isClaimed || !isClaimedByCurrentUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticketId}/unclaim`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aufheben der Beanspruchung');
      }

      toast({
        title: 'Beanspruchung aufgehoben',
        description: 'Die Beanspruchung des Tickets wurde aufgehoben.',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Aufheben der Beanspruchung:', error);
      toast({
        title: 'Fehler',
        description: 'Die Beanspruchung konnte nicht aufgehoben werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ticket schließen
  const handleCloseTicket = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticketId}/close`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Schließen des Tickets');
      }

      toast({
        title: 'Ticket geschlossen',
        description: 'Das Ticket wurde erfolgreich geschlossen.',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Schließen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: 'Das Ticket konnte nicht geschlossen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsCloseDialogOpen(false);
    }
  };

  // Ticket löschen/archivieren
  const handleDeleteTicket = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Tickets');
      }

      toast({
        title: 'Ticket gelöscht',
        description: 'Das Ticket wurde erfolgreich gelöscht.',
      });
      
      router.push(`/dashboard/${serverId}/tickets`);
    } catch (error) {
      console.error('Fehler beim Löschen des Tickets:', error);
      toast({
        title: 'Fehler',
        description: 'Das Ticket konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {isOpen && !isClaimed && (
        <>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={() => setIsClaimDialogOpen(true)}
            disabled={isLoading}
          >
            <Tag className="mr-2 h-4 w-4" />
            Beanspruchen
          </Button>

          <AlertDialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ticket beanspruchen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie dieses Ticket beanspruchen? Sie werden damit als verantwortlicher Mitarbeiter für dieses Ticket gekennzeichnet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleClaimTicket();
                  }}
                  disabled={isLoading}
                >
                  Beanspruchen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {isOpen && isClaimed && isClaimedByCurrentUser && (
        <Button
          variant="outline"
          className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
          onClick={handleUnclaimTicket}
          disabled={isLoading}
        >
          <Unlock className="mr-2 h-4 w-4" />
          Beanspruchung aufheben
        </Button>
      )}

      {isOpen && (
        <>
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => setIsCloseDialogOpen(true)}
            disabled={isLoading}
          >
            <Lock className="mr-2 h-4 w-4" />
            Schließen
          </Button>

          <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ticket schließen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie dieses Ticket schließen? Dies kennzeichnet das Ticket als abgeschlossen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseTicket();
                  }}
                  disabled={isLoading}
                >
                  Schließen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      <Button
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={isLoading}
      >
        <Archive className="mr-2 h-4 w-4" />
        Löschen
      </Button>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket löschen</AlertDialogTitle>
            <AlertDialogDescription>
              <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
              Möchten Sie dieses Ticket wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTicket();
              }}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketActionButtons;
