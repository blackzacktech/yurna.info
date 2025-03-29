"use client"

import { FC, useState } from 'react';
import { TicketQuestion } from '@prisma/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: TicketQuestion;
  categoryId: string;
  serverId: string;
}

const questionSchema = z.object({
  text: z.string().min(3, {
    message: 'Die Frage muss mindestens 3 Zeichen lang sein.',
  }),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
});

type FormValues = z.infer<typeof questionSchema>;

const EditQuestionDialog: FC<EditQuestionDialogProps> = ({
  open,
  onOpenChange,
  question,
  categoryId,
  serverId,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: question.text,
      placeholder: question.placeholder || '',
      required: question.required,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren der Frage');
      }

      toast({
        title: 'Frage aktualisiert',
        description: 'Die Frage wurde erfolgreich aktualisiert.',
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Frage:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Frage bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere die Frage und ihre Eigenschaften.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frage</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bitte beschreibe dein Problem im Detail..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platzhalter (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="z.B. Beschreibe dein Problem hier..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Ein Platzhaltertext, der in der Antwortbox angezeigt wird
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Erforderlich</FormLabel>
                    <FormDescription>
                      Nutzer müssen diese Frage beantworten
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  'Änderungen speichern'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
