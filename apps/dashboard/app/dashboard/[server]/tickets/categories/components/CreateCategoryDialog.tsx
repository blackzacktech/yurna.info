import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Buttons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';

// Validierungsschema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Der Name muss mindestens 2 Zeichen lang sein.',
  }).max(50, {
    message: 'Der Name darf maximal 50 Zeichen lang sein.',
  }),
  description: z.string().min(10, {
    message: 'Die Beschreibung muss mindestens 10 Zeichen lang sein.',
  }).max(500, {
    message: 'Die Beschreibung darf maximal 500 Zeichen lang sein.',
  }),
  emoji: z.string().min(1, {
    message: 'Bitte gib ein Emoji ein.',
  }).max(10, {
    message: 'Das Emoji darf maximal 10 Zeichen lang sein.',
  }),
  channelName: z.string().min(2, {
    message: 'Der Kanalname muss mindestens 2 Zeichen lang sein.',
  }).max(100, {
    message: 'Der Kanalname darf maximal 100 Zeichen lang sein.',
  }),
  discordCategory: z.string().min(18, {
    message: 'Bitte gib eine gültige Discord-Kategorie-ID ein.',
  }).max(19, {
    message: 'Bitte gib eine gültige Discord-Kategorie-ID ein.',
  }),
  openingMessage: z.string().min(10, {
    message: 'Die Eröffnungsnachricht muss mindestens 10 Zeichen lang sein.',
  }).max(1000, {
    message: 'Die Eröffnungsnachricht darf maximal 1000 Zeichen lang sein.',
  }),
  memberLimit: z.number().int().min(1, {
    message: 'Das Limit muss mindestens 1 sein.',
  }).max(100, {
    message: 'Das Limit darf maximal 100 sein.',
  }),
  totalLimit: z.number().int().min(1, {
    message: 'Das Gesamtlimit muss mindestens 1 sein.',
  }).max(1000, {
    message: 'Das Gesamtlimit darf maximal 1000 sein.',
  }),
});

interface CreateCategoryDialogProps {
  serverId: string;
}

const CreateCategoryDialog: FC<CreateCategoryDialogProps> = ({ serverId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      emoji: '🎫',
      channelName: 'ticket-{number}',
      discordCategory: '',
      openingMessage: 'Herzlich willkommen zum Support! Bitte beschreibe dein Anliegen und warte auf eine Antwort von unserem Team.',
      memberLimit: 1,
      totalLimit: 50,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${serverId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          claiming: false,
          enableFeedback: true,
          requireTopic: false,
          staffRoles: [], // Diese Liste sollte in einer erweiterten Version anpassbar sein
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ein Fehler ist aufgetreten');
      }

      const category = await response.json();
      
      toast({
        title: 'Kategorie erstellt',
        description: `Die Kategorie "${values.name}" wurde erfolgreich erstellt.`,
      });
      
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Kategorie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Neue Ticket-Kategorie erstellen</DialogTitle>
          <DialogDescription>
            Erstelle eine neue Kategorie für Tickets mit eigenen Einstellungen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Allgemeiner Support" {...field} />
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
                      <Input placeholder="🎫" {...field} />
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
                    <Textarea 
                      placeholder="Kurze Beschreibung der Ticket-Kategorie"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kanalname</FormLabel>
                    <FormControl>
                      <Input placeholder="ticket-{number}" {...field} />
                    </FormControl>
                    <FormDescription>
                      {'{number}'} wird durch die Ticket-Nummer ersetzt
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
                      <Input placeholder="Kategorie-ID aus Discord" {...field} />
                    </FormControl>
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
                    <Textarea 
                      placeholder="Diese Nachricht wird beim Öffnen eines neuen Tickets gesendet"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit pro Nutzer</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
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
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Wird erstellt...' : 'Kategorie erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
