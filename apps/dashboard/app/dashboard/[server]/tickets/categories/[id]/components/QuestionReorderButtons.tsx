import React from 'react';
import { Button } from '@/components/ui/Buttons';
import { Icons, iconVariants } from '@/components/ui/Icons';
import { toast } from 'sonner';

interface QuestionReorderButtonsProps {
  questionId: string;
  categoryId: string;
  serverId: string;
  isFirst: boolean;
  isLast: boolean;
  onReorder: () => void;
}

const QuestionReorderButtons: React.FC<QuestionReorderButtonsProps> = ({
  questionId,
  categoryId,
  serverId,
  isFirst,
  isLast,
  onReorder
}) => {
  const handleReorder = async (direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          direction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Ändern der Reihenfolge');
      }

      toast.success('Reihenfolge geändert');
      onReorder();
    } catch (error) {
      toast.error('Fehler beim Ändern der Reihenfolge');
      console.error('Fehler beim Ändern der Reihenfolge:', error);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => handleReorder('up')}
        disabled={isFirst}
        title="Nach oben verschieben"
      >
        <Icons.arrowUp className={iconVariants({ variant: "small" })} />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => handleReorder('down')}
        disabled={isLast}
        title="Nach unten verschieben"
      >
        <Icons.arrowDown className={iconVariants({ variant: "small" })} />
      </Button>
    </div>
  );
};

export default QuestionReorderButtons;
