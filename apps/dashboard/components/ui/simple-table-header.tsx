"use client";

import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleTableHeaderProps {
  title: string;
  sortable?: boolean;
  onSort?: () => void;
}

export function SimpleTableHeader({ 
  title, 
  sortable = false, 
  onSort 
}: SimpleTableHeaderProps) {
  if (sortable && onSort) {
    return (
      <Button
        variant="ghost"
        onClick={onSort}
        className="p-0 font-medium hover:bg-transparent"
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  }
  
  return <span className="font-medium">{title}</span>;
}
