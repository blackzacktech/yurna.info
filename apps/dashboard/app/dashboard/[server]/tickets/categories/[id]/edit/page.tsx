import { getGuildInfo } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

import EditCategoryForm from './components/EditCategoryForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

export default async function EditCategoryPage({
  params
}: {
  params: { server: string; id: string };
}) {
  const { server, id } = params;

  // Guild-Daten abrufen
  const guild = await getGuildInfo(server);
  if (!guild) redirect('/dashboard');

  // Kategorie-Daten abrufen
  const category = await prismaClient.ticketCategory.findUnique({
    where: {
      id,
      guildId: server,
    },
    include: {
      questions: true,
    },
  });

  if (!category) {
    notFound();
  }

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
          <span>Kategorie bearbeiten</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Kategorie bearbeiten: {category.emoji} {category.name}
        </h1>
      </div>

      <EditCategoryForm 
        category={category} 
        serverId={server} 
      />
    </div>
  );
}
