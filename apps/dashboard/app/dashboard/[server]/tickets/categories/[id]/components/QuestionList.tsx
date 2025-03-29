import { FC, useState } from 'react';
import { TicketQuestion } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import EditQuestionDialog from './EditQuestionDialog';
import QuestionReorderButtons from './QuestionReorderButtons';

interface QuestionListProps {
  questions: TicketQuestion[];
  categoryId: string;
  serverId: string;
}

const QuestionList: FC<QuestionListProps> = ({ questions, categoryId, serverId }) => {
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState<TicketQuestion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Frage löschen
  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions/${selectedQuestion.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen der Frage');
      }

      toast({
        title: 'Frage gelöscht',
        description: 'Die Frage wurde erfolgreich gelöscht.',
      });

      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Löschen der Frage:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  // Reihenfolge ändern
  const handleReorder = async (questionId: string, direction: 'up' | 'down') => {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Ändern der Reihenfolge');
      }

      router.refresh();
    } catch (error) {
      console.error('Fehler beim Ändern der Reihenfolge:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Ticket-Fragen</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsReordering(!isReordering)}
          >
            {isReordering ? 'Fertig' : 'Reihenfolge ändern'}
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-2">Keine Fragen vorhanden</p>
              <p className="text-sm text-muted-foreground mb-4">
                Fragen werden Nutzern beim Erstellen eines Tickets angezeigt. 
                Füge Fragen hinzu, um mehr Informationen von den Nutzern zu erhalten.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id} className="relative">
                {isReordering && (
                  <div className="absolute left-2 inset-y-0 flex items-center justify-center">
                    <QuestionReorderButtons
                      questionId={question.id}
                      categoryId={categoryId}
                      serverId={serverId}
                      isFirst={index === 0}
                      isLast={index === questions.length - 1}
                      onReorder={() => router.refresh()}
                    />
                  </div>
                )}
                <CardHeader className={`pb-2 ${isReordering ? 'pl-12' : ''}`}>
                  <CardTitle className="text-base">Frage {index + 1}</CardTitle>
                  <CardDescription className="mt-1 text-base font-normal">{question.text}</CardDescription>
                </CardHeader>
                <CardContent className={`pt-0 flex justify-between items-center ${isReordering ? 'pl-12' : ''}`}>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {question.required && (
                      <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded text-xs">
                        Erforderlich
                      </span>
                    )}
                    {question.placeholder && (
                      <span>Platzhalter: {question.placeholder}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog zum Bearbeiten einer Frage */}
      {selectedQuestion && (
        <EditQuestionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          question={selectedQuestion}
          categoryId={categoryId}
          serverId={serverId}
        />
      )}

      {/* Dialog zum Löschen einer Frage */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Frage löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diese Frage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              Frage löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuestionList;
