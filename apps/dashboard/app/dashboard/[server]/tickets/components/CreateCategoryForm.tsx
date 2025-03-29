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

interface CreateCategoryFormProps {
  serverId: string;
  onSuccess: () => void;
}

const CreateCategoryForm: FC<CreateCategoryFormProps> = ({ serverId, onSuccess }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      emoji: '🎫',
      channelName: 'ticket-{id}',
      discordCategory: '',
      openingMessage: 'Danke für dein Ticket! Ein Teammitglied wird sich in Kürze um dein Anliegen kümmern.',
      memberLimit: 1,
      totalLimit: 50,
      claiming: false,
      enableFeedback: true,
      requireTopic: false,
      staffRoles: [],
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tickets/${serverId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Erstellen der Kategorie');
      }

      toast({
        title: 'Kategorie erstellt',
        description: 'Die Ticket-Kategorie wurde erfolgreich erstellt.',
      });

      router.refresh();
      onSuccess();
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Wird erstellt...' : 'Kategorie erstellen'}
        </Button>
      </form>
    </Form>
  );
};

export default CreateCategoryForm;
