"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

// Schema für Ticket-Einstellungen
const ticketSettingsSchema = z.object({
  maxOpenTickets: z.coerce.number().int().min(1).max(25),
  ticketsPerUser: z.coerce.number().int().min(1).max(10),
  allowAnonymousTickets: z.boolean(),
  autoCloseAfterDays: z.coerce.number().int().min(0).max(30),
  sendTranscriptsToUser: z.boolean(),
  transcriptFormat: z.enum(['text', 'html', 'pdf']),
  notifyAdminsOnNewTicket: z.boolean(),
});

type TicketSettings = z.infer<typeof ticketSettingsSchema>;

interface TicketSettingsFormProps {
  serverId: string;
  initialSettings: any;
}

export default function TicketSettingsForm({ serverId, initialSettings }: TicketSettingsFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Default-Werte für die Einstellungen
  const defaultSettings: TicketSettings = {
    maxOpenTickets: 50,
    ticketsPerUser: 3,
    allowAnonymousTickets: false,
    autoCloseAfterDays: 7,
    sendTranscriptsToUser: true,
    transcriptFormat: 'text',
    notifyAdminsOnNewTicket: true,
  };

  // Formulardaten mit initialSettings oder Default-Werten
  const mergedSettings = {
    ...defaultSettings,
    ...(initialSettings || {})
  };

  const form = useForm<TicketSettings>({
    resolver: zodResolver(ticketSettingsSchema),
    defaultValues: mergedSettings,
  });

  const onSubmit = async (data: TicketSettings) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/guilds/${serverId}/settings/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save ticket settings');
      }

      toast({
        title: "Einstellungen gespeichert",
        description: "Die Ticket-Einstellungen wurden erfolgreich aktualisiert.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving ticket settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Einstellungen konnten nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allgemeine Ticket-Einstellungen</CardTitle>
        <CardDescription>
          Konfiguriere die grundlegenden Einstellungen für dein Ticket-System.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="maxOpenTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximale Anzahl offener Tickets</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="25" {...field} />
                  </FormControl>
                  <FormDescription>
                    Die maximale Anzahl an Tickets, die gleichzeitig geöffnet sein können.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketsPerUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tickets pro Benutzer</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormDescription>
                    Wie viele Tickets ein einzelner Benutzer gleichzeitig öffnen darf.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoCloseAfterDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automatisches Schließen nach X Tagen</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="30" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tickets werden automatisch geschlossen, wenn sie für diese Anzahl an Tagen inaktiv sind. 0 = niemals automatisch schließen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transcriptFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcript-Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle ein Format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Einfacher Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Format für Ticket-Transcripts, wenn Tickets geschlossen werden.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between space-y-0 pt-2">
              <FormField
                control={form.control}
                name="allowAnonymousTickets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Anonyme Tickets</FormLabel>
                      <FormDescription>
                        Benutzer können Tickets anonym erstellen.
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

            <div className="flex items-center justify-between space-y-0 pt-2">
              <FormField
                control={form.control}
                name="sendTranscriptsToUser"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Transcripts an Benutzer senden</FormLabel>
                      <FormDescription>
                        Sendet eine Kopie des Ticket-Verlaufs an den Benutzer, wenn ein Ticket geschlossen wird.
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

            <div className="flex items-center justify-between space-y-0 pt-2">
              <FormField
                control={form.control}
                name="notifyAdminsOnNewTicket"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Admins bei neuen Tickets benachrichtigen</FormLabel>
                      <FormDescription>
                        Server-Admins werden benachrichtigt, wenn ein neues Ticket erstellt wird.
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

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Einstellungen speichern"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
