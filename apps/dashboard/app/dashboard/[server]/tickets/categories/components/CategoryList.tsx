import { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Buttons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Edit, MessageSquare, Trash } from 'lucide-react';
import DeleteCategoryDialog from './DeleteCategoryDialog';

interface TicketCategory {
  id: number;
  name: string;
  emoji: string;
  description: string;
  memberLimit: number;
  totalLimit: number;
  _count: {
    tickets: number;
  };
}

interface CategoryListProps {
  categories: TicketCategory[];
  serverId: string;
}

const CategoryList: FC<CategoryListProps> = ({ categories, serverId }) => {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h3 className="text-lg font-medium">Keine Kategorien gefunden</h3>
        <p className="mt-2 text-muted-foreground">
          Erstelle eine neue Kategorie, um Tickets zu organisieren.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>
                {category.emoji} {category.name}
              </CardTitle>
              <Badge>
                {category._count.tickets} Ticket{category._count.tickets !== 1 ? 's' : ''}
              </Badge>
            </div>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Limit pro Nutzer:</span>
                <span className="ml-2">{category.memberLimit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gesamtlimit:</span>
                <span className="ml-2">{category.totalLimit}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary" asChild>
              <Link href={`/dashboard/${serverId}/tickets/categories/${category.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Fragen verwalten
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/${serverId}/tickets/categories/${category.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <DeleteCategoryDialog category={category} serverId={serverId} />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CategoryList;
