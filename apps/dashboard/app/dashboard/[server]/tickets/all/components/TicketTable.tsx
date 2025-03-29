import { FC } from 'react';
import { Table, SimpleTableHeader } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/Buttons';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

// Define interfaces that match your Prisma schema
interface TicketCategory {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

interface User {
  id: string;
  username: string;
}

interface TicketWithRelations {
  id: string;
  number: number;
  topic: string | null;
  category: TicketCategory | null;
  createdBy: User;
  createdAt: Date;
  open: boolean;
  deleted: boolean;
  claimedById: string | null;
}

interface TicketTableProps {
  tickets: TicketWithRelations[];
  currentPage: number;
  totalPages: number;
  serverId: string;
  tab: string;
}

// Define header rendering component separately
const NumberCell = ({ value }: { value: number }) => {
  return <div className="font-medium">#{value}</div>;
};

const TopicCell = ({ value }: { value: string | null }) => {
  return value ? <div>{value}</div> : <div className="text-muted-foreground">Kein Thema angegeben</div>;
};

const CategoryCell = ({ category }: { category: TicketCategory | null }) => {
  return category ? 
    <div>{category.emoji} {category.name}</div> : 
    <div className="text-muted-foreground">Keine Kategorie</div>;
};

const StatusCell = ({ ticket }: { ticket: TicketWithRelations }) => {
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
};

const UserCell = ({ username }: { username: string }) => {
  return <div>{username}</div>;
};

const DateCell = ({ date }: { date: Date }) => {
  return <div>{format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: de })}</div>;
};

const ActionCell = ({ ticketId, serverId }: { ticketId: string, serverId: string }) => {
  return (
    <div className="text-right">
      <Button variant="secondary" asChild>
        <Link href={`/dashboard/${serverId}/tickets/${ticketId}`}>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

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
      header: () => <SimpleTableHeader title="Nr." />,
      cell: ({ row }) => <NumberCell value={row.getValue('number')} />,
    },
    {
      accessorKey: 'topic',
      header: () => <SimpleTableHeader title="Thema" />,
      cell: ({ row }) => <TopicCell value={row.getValue('topic')} />,
    },
    {
      accessorKey: 'category',
      header: () => <SimpleTableHeader title="Kategorie" />,
      cell: ({ row }) => <CategoryCell category={row.original.category} />,
    },
    {
      accessorKey: 'status',
      header: () => <SimpleTableHeader title="Status" />,
      cell: ({ row }) => <StatusCell ticket={row.original} />,
    },
    {
      accessorKey: 'createdBy',
      header: () => <SimpleTableHeader title="Erstellt von" />,
      cell: ({ row }) => <UserCell username={row.original.createdBy.username} />,
    },
    {
      accessorKey: 'createdAt',
      header: () => <SimpleTableHeader title="Erstellt am" />,
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionCell ticketId={row.original.id} serverId={serverId} />,
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
