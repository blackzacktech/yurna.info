"use client";

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Clock, X, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SimpleTableHeader } from '@/components/ui/simple-table-header';
import Link from 'next/link';
import { format } from 'date-fns';

// Neue Komponenten für Zellen definieren
const NumberCell = ({ value }: { value: number }) => (
  <span className="font-medium">#{value}</span>
);

const TopicCell = ({ value }: { value: string | null }) => (
  <span className="truncate max-w-[200px] block">
    {value || <span className="text-muted-foreground italic">Kein Thema</span>}
  </span>
);

const CreatedByCell = ({ ticket }: { ticket: any }) => (
  <div className="flex items-center gap-2">
    {ticket.createdBy && (
      <>
        {ticket.createdBy.avatar && (
          <img 
            src={ticket.createdBy.avatar} 
            alt={ticket.createdBy.username} 
            className="w-6 h-6 rounded-full"
          />
        )}
        <span>{ticket.createdBy.username}</span>
      </>
    )}
  </div>
);

const StatusCell = ({ value }: { value: boolean }) => (
  <Badge variant={value ? "success" : "destructive"}>
    {value ? (
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" /> Offen
      </span>
    ) : (
      <span className="flex items-center gap-1">
        <X className="w-3 h-3" /> Geschlossen
      </span>
    )}
  </Badge>
);

const ClaimedByCell = ({ ticket }: { ticket: any }) => (
  <div>
    {ticket.claimedBy ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        {ticket.claimedBy.username}
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">Nicht beansprucht</Badge>
    )}
  </div>
);

const CategoryCell = ({ ticket }: { ticket: any }) => (
  <Badge variant="secondary">{ticket.category?.name || 'Unbekannt'}</Badge>
);

const ActionsCell = ({ ticket, serverId }: { ticket: any, serverId: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <Link href={`/dashboard/${serverId}/tickets/${ticket.id}`}>
          <Eye className="mr-2 w-4 h-4" /> Details anzeigen
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Erweitere den TicketWithRelations Typ
interface TicketWithRelations {
  id: string;
  number: number;
  topic: string | null;
  open: boolean;
  createdBy: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
  claimedBy: {
    id: string;
    username: string;
    avatar?: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

interface TicketTableProps {
  tickets: TicketWithRelations[];
  serverId: string;
}

export function TicketTable({ tickets, serverId }: TicketTableProps) {
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
      accessorKey: 'createdBy',
      header: () => <SimpleTableHeader title="Erstellt von" />,
      cell: ({ row }) => <CreatedByCell ticket={row.original} />,
    },
    {
      accessorKey: 'status',
      header: () => <SimpleTableHeader title="Status" />,
      cell: ({ row }) => <StatusCell value={row.original.open} />,
    },
    {
      accessorKey: 'claimedBy',
      header: () => <SimpleTableHeader title="Bearbeiter" />,
      cell: ({ row }) => <ClaimedByCell ticket={row.original} />,
    },
    {
      accessorKey: 'category',
      header: () => <SimpleTableHeader title="Kategorie" />,
      cell: ({ row }) => <CategoryCell ticket={row.original} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell ticket={row.original} serverId={serverId} />,
    },
  ];

  return (
    <div className="rounded-md border">
      <Table columns={columns} data={tickets} />
    </div>
  );
}
