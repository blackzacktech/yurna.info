"use client"

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { TicketCategory, TicketQuestion } from '@prisma/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const categorySchema = z.object({
  name: z.string().min(2, {
    message: 'Der Name muss mindestens 2 Zeichen lang sein.',
  }),
  description: z.string().min(10, {
    message: 'Die Beschreibung muss mindestens 10 Zeichen lang sein.',
  }),
  emoji: z.string().min(1, {
    message: 'Bitte wähle ein Emoji.',
  }),
  channelName: z.string().min(2, {
    message: 'Der Kanalname muss mindestens 2 Zeichen lang sein.',
  }),
  discordCategory: z.string().min(17, {
    message: 'Bitte gib eine gültige Discord-Kategorie-ID ein.',
  }),
  openingMessage: z.string().min(10, {
    message: 'Die Eröffnungsnachricht muss mindestens 10 Zeichen lang sein.',
  }),
  memberLimit: z.number().min(1, {
    message: 'Das Limit pro Nutzer muss mindestens 1 sein.',
  }),
  totalLimit: z.number().min(5, {
    message: 'Das Gesamtlimit muss mindestens 5 sein.',
  }),
  claiming: z.boolean(),
  enableFeedback: z.boolean(),
  requireTopic: z.boolean(),
  staffRoles: z.array(z.string()),
});

type FormValues = z.infer<typeof categorySchema>;

interface CategoryWithQuestions extends TicketCategory {
  questions: TicketQuestion[];
}

interface EditCategoryFormProps {
  category: CategoryWithQuestions;
  serverId: string;
}

const EditCategoryForm: FC<EditCategoryFormProps> = ({ category, serverId }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      emoji: category.emoji,
      channelName: category.channelName,
      discordCategory: category.discordCategory,
      openingMessage: category.openingMessage,
      memberLimit: category.memberLimit,
      totalLimit: category.totalLimit,
      claiming: category.claiming,
      enableFeedback: category.enableFeedback,
      requireTopic: category.requireTopic,
      staffRoles: category.staffRoles,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tickets/${serverId}/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Aktualisieren der Kategorie');
      }

      toast({
        title: 'Kategorie aktualisiert',
        description: 'Die Ticket-Kategorie wurde erfolgreich aktualisiert.',
      });

      router.push(`/dashboard/${serverId}/tickets`);
      router.refresh();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Kategorie:', err);
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.');
      toast({
        title: 'Fehler',
        description: err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategoriename</FormLabel>
                    <FormControl>
                      <Input placeholder="Support" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <EmojiPicker 
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Support für allgemeine Fragen und Probleme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kanalname</FormLabel>
                    <FormControl>
                      <Input placeholder="ticket-{id}" {...field} />
                    </FormControl>
                    <FormDescription>
                      {'{id}'} wird durch die Ticket-Nummer ersetzt, {'{username}'} durch den Benutzernamen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discordCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord-Kategorie-ID</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890123456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Die ID der Discord-Kategorie, in der Ticket-Kanäle erstellt werden
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="openingMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eröffnungsnachricht</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Danke für dein Ticket!" {...field} />
                  </FormControl>
                  <FormDescription>
                    Die Nachricht, die beim Öffnen eines Tickets gesendet wird
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit pro Nutzer</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        placeholder="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximale Anzahl an Tickets pro Nutzer in dieser Kategorie
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gesamtlimit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={5} 
                        placeholder="50" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximale Anzahl an gleichzeitig offenen Tickets in dieser Kategorie
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="claiming"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Beanspruchung</FormLabel>
                      <FormDescription>
                        Teammitglieder können Tickets für sich beanspruchen
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

              <FormField
                control={form.control}
                name="enableFeedback"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Feedback</FormLabel>
                      <FormDescription>
                        Nutzer können Feedback nach Ticketschließung geben
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

              <FormField
                control={form.control}
                name="requireTopic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Thema erforderlich</FormLabel>
                      <FormDescription>
                        Nutzer müssen ein Thema angeben
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
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/dashboard/${serverId}/tickets`)}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  'Kategorie speichern'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditCategoryForm;
