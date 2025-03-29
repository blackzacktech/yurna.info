import { FC, useState } from 'react';
import { TicketCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Edit, Trash, ClipboardList, Check, X, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import CreateCategoryForm from './CreateCategoryForm';

interface TicketCategoryListProps {
  categories: TicketCategory[];
  serverId: string;
}

const TicketCategoryList: FC<TicketCategoryListProps> = ({ categories, serverId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            Verwalten Sie hier die Ticket-Kategorien und deren zugehörige Fragen für das Support-System
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusCircle className="h-4 w-4 mr-2" />
              Neue Kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neue Ticket-Kategorie erstellen</DialogTitle>
              <DialogDescription>
                Erstelle eine neue Kategorie für Supporttickets
              </DialogDescription>
            </DialogHeader>
            <CreateCategoryForm 
              serverId={serverId} 
              onSuccess={() => setIsCreateDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p className="text-muted-foreground mb-4">Keine Ticket-Kategorien vorhanden</p>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Erste Kategorie erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              serverId={serverId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoryCardProps {
  category: TicketCategory;
  serverId: string;
}

const CategoryCard: FC<CategoryCardProps> = ({ category, serverId }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{category.emoji}</span>
          <CardTitle>{category.name}</CardTitle>
        </div>
        <CardDescription className="mt-1.5">
          {category.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Kanalnamen</span>
            <span>{category.channelName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Limit pro Nutzer</span>
            <span>{category.memberLimit}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Gesamtlimit</span>
            <span>{category.totalLimit}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Beanspruchbar</span>
            <span>{category.claiming ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Feedback</span>
            <span>{category.enableFeedback ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Thema erforderlich</span>
            <span>{category.requireTopic ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/${serverId}/tickets/categories/${category.id}`}>
                  <ClipboardList className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fragen verwalten</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/dashboard/${serverId}/tickets/categories/${category.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bearbeiten</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="text-red-500">
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Löschen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TicketCategoryList;
