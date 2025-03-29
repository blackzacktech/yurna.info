import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type TicketStatus = 'open' | 'claimed' | 'closed' | 'deleted';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          variant: 'outline',
          label: 'Offen',
          icon: <Clock className="mr-1 h-3 w-3" />,
          className: 'text-yellow-500 border-yellow-500',
        };
      case 'claimed':
        return {
          variant: 'outline',
          label: 'In Bearbeitung',
          icon: <AlertCircle className="mr-1 h-3 w-3" />,
          className: 'text-blue-500 border-blue-500',
        };
      case 'closed':
        return {
          variant: 'outline',
          label: 'Geschlossen',
          icon: <CheckCircle className="mr-1 h-3 w-3" />,
          className: 'text-green-500 border-green-500',
        };
      case 'deleted':
        return {
          variant: 'outline',
          label: 'Gelöscht',
          icon: <XCircle className="mr-1 h-3 w-3" />,
          className: 'text-red-500 border-red-500',
        };
      default:
        return {
          variant: 'outline',
          label: 'Unbekannt',
          icon: null,
          className: '',
        };
    }
  };

  const { variant, label, icon, className: statusClassName } = getStatusConfig();

  return (
    <Badge variant={variant as any} className={`${statusClassName} ${className} flex items-center`}>
      {icon}
      {label}
    </Badge>
  );
};

export default TicketStatusBadge;
