import { getGuildInfo } from '@yurna/util/functions/guild';
import prismaClient from '@yurna/database';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ChevronRight, Edit, PlusCircle } from 'lucide-react';
import QuestionList from './components/QuestionList';
import CreateQuestionDialog from './components/CreateQuestionDialog';

export default async function CategoryQuestionsPage({
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
  });

  if (!category) {
    notFound();
  }

  // Fragen abrufen
  const questions = await prismaClient.ticketQuestion.findMany({
    where: {
      categoryId: id,
    },
    orderBy: {
      order: 'asc',
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
          <span>Kategorie-Fragen</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/${server}/tickets/categories/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Kategorie bearbeiten
            </Link>
          </Button>
          <CreateQuestionDialog 
            categoryId={id} 
            serverId={server} 
            existingQuestions={questions}
          />
        </div>
      </div>

      <QuestionList 
        questions={questions} 
        categoryId={id} 
        serverId={server} 
      />
    </div>
  );
}
