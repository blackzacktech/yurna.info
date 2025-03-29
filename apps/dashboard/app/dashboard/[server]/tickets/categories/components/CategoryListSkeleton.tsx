import { FC } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const CategoryListSkeleton: FC = () => {
  // Erstellt ein Array mit 3 Elementen für die Skeleton-Karten
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CategoryListSkeleton;
