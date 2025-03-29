import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center py-3">
              <div className="flex space-x-4 items-center">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[120px]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 py-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-5 w-[100px]" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
};

export default TableSkeleton;
