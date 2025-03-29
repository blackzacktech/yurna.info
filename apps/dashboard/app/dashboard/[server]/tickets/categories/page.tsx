import { getGuildInfo } from '@yurna/util/functions/guild';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Buttons';
import Link from 'next/link';
import prismaClient from '@yurna/database';
import CategoryList from './components/CategoryList';
import CategoryListSkeleton from './components/CategoryListSkeleton';
import CreateCategoryDialog from './components/CreateCategoryDialog';

export default async function TicketCategoriesPage({ 
  params 
}: { 
  params: { server: string };
}) {
  const { server } = params;
  
  // Guild-Daten abrufen
  const guild = await getGuildInfo(server);
  if (!guild) redirect('/dashboard');

  // Kategorien abrufen
  const categories = await prismaClient.ticketCategory.findMany({
    where: {
      guildId: server,
    },
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          tickets: {
            where: {
              open: true,
              deleted: false,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb separator={<ChevronRight className="h-4 w-4" />}>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/${server}`}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/dashboard/${server}/tickets`}>Tickets</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span>Kategorien</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ticket-Kategorien für {guild.name}</h1>
        <CreateCategoryDialog serverId={server} />
      </div>

      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList categories={categories} serverId={server} />
      </Suspense>
    </div>
  );
}
