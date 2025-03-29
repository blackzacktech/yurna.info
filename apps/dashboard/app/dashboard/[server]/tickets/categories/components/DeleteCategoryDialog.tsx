"use client";

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Buttons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/use-toast';
import { Trash } from 'lucide-react';

interface TicketCategory {
  id: number;
  name: string;
  emoji: string;
  _count?: {
    tickets: number;
  };
}

interface DeleteCategoryDialogProps {
  category: TicketCategory;
  serverId: string;
}

const DeleteCategoryDialog: FC<DeleteCategoryDialogProps> = ({ category, serverId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const hasActiveTickets = category._count && category._count.tickets > 0;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ein Fehler ist aufgetreten');
      }
      
      toast({
        title: 'Kategorie gelöscht',
        description: `Die Kategorie "${category.name}" wurde erfolgreich gelöscht.`,
      });
      
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategorie löschen</DialogTitle>
          <DialogDescription>
            Bist du sicher, dass du die Kategorie "{category.emoji} {category.name}" löschen möchtest?
            {hasActiveTickets && (
              <span className="block mt-2 text-destructive font-semibold">
                Diese Kategorie hat noch {category._count?.tickets} aktive Tickets.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button
            variant="red"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Wird gelöscht...' : 'Löschen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
