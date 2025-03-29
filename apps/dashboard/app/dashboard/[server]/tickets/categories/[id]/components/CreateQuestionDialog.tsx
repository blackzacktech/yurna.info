"use client"

import { FC, useState } from 'react';
import { TicketQuestion } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';

interface CreateQuestionDialogProps {
  categoryId: string;
  serverId: string;
  existingQuestions: TicketQuestion[];
}

const questionSchema = z.object({
  text: z.string().min(3, {
    message: 'Die Frage muss mindestens 3 Zeichen lang sein.',
  }),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
});

type FormValues = z.infer<typeof questionSchema>;

const CreateQuestionDialog: FC<CreateQuestionDialogProps> = ({ 
  categoryId, 
  serverId,
  existingQuestions
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      placeholder: '',
      required: false,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          order: existingQuestions.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen der Frage');
      }

      toast({
        title: 'Frage erstellt',
        description: 'Die Frage wurde erfolgreich hinzugefügt.',
      });

      form.reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Fehler beim Erstellen der Frage:', error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Frage hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Frage hinzufügen</DialogTitle>
          <DialogDescription>
            Füge eine Frage hinzu, die Nutzer beim Erstellen eines Tickets beantworten müssen.
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
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  'Frage hinzufügen'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionDialog;
