import { FC } from 'react';
import { Ticket, TicketCategory, User } from '@prisma/client';
import { Table, TableColumnHeader } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/Buttons';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface TicketWithRelations extends Ticket {
  category: TicketCategory | null;
  createdBy: User;
  claimedBy: User | null;
  closedBy: User | null;
}

interface TicketTableProps {
  tickets: TicketWithRelations[];
  currentPage: number;
  totalPages: number;
  serverId: string;
  tab: string;
}

const TicketTable: FC<TicketTableProps> = ({ 
  tickets, 
  currentPage, 
  totalPages, 
  serverId,
  tab
}) => {
  const columns: ColumnDef<TicketWithRelations>[] = [
    {
      accessorKey: 'number',
      header: ({ column }) => <TableColumnHeader column={column} title="Nr." />,
      cell: ({ row }) => <div className="font-medium">#{row.getValue('number')}</div>,
    },
    {
      accessorKey: 'topic',
      header: ({ column }) => <TableColumnHeader column={column} title="Thema" />,
      cell: ({ row }) => {
        const topic = row.getValue('topic') as string;
        return topic ? <div>{topic}</div> : <div className="text-muted-foreground">Kein Thema angegeben</div>;
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <TableColumnHeader column={column} title="Kategorie" />,
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? 
          <div>{category.emoji} {category.name}</div> : 
          <div className="text-muted-foreground">Keine Kategorie</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="flex items-center gap-2">
            {ticket.deleted ? (
              <Badge variant="destructive">Geschlossen</Badge>
            ) : ticket.open ? (
              <Badge variant="default">Offen</Badge>
            ) : (
              <Badge variant="secondary">Wartend</Badge>
            )}
            
            {ticket.claimedById && (
              <Badge variant="outline">Beansprucht</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdBy',
      header: ({ column }) => <TableColumnHeader column={column} title="Erstellt von" />,
      cell: ({ row }) => <div>{row.original.createdBy.username}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <TableColumnHeader column={column} title="Erstellt am" />,
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div>{format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: de })}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="secondary" size="icon" asChild>
              <Link href={`/dashboard/${serverId}/tickets/${row.original.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} data={tickets} />

      {/* Paginierung */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            asChild
          >
            <Link
              href={`/dashboard/${serverId}/tickets/all?tab=${tab}&page=${currentPage - 1}`}
              aria-label="Vorherige Seite"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {currentPage} von {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            asChild
          >
            <Link
              href={`/dashboard/${serverId}/tickets/all?tab=${tab}&page=${currentPage + 1}`}
              aria-label="Nächste Seite"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketTable;
