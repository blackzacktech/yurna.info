"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/Input';

// Schema für Ticket-Nachrichteneinstellungen
const ticketMessageSchema = z.object({
  welcomeMessage: z.string().min(10).max(1500),
  ticketCreatedMessage: z.string().min(10).max(1500),
  ticketClosedMessage: z.string().min(10).max(1500),
  buttonLabel: z.string().min(1).max(80),
  modalTitle: z.string().min(1).max(80),
});

type TicketMessageSettings = z.infer<typeof ticketMessageSchema>;

interface TicketMessageSettingsProps {
  serverId: string;
  categories: any[];
  initialSettings: any;
}

export default function TicketMessageSettings({ serverId, categories, initialSettings }: TicketMessageSettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Default-Werte für die Nachrichteneinstellungen
  const defaultSettings: TicketMessageSettings = {
    welcomeMessage: "Willkommen bei unserem Support-System! Bitte wähle eine der folgenden Kategorien, um ein Ticket zu erstellen.",
    ticketCreatedMessage: "Vielen Dank für dein Ticket! Ein Teammitglied wird sich in Kürze um dein Anliegen kümmern. Bitte beschreibe dein Problem so detailliert wie möglich.",
    ticketClosedMessage: "Dieses Ticket wurde geschlossen. Wenn du weitere Fragen hast, kannst du jederzeit ein neues Ticket erstellen.",
    buttonLabel: "Support-Ticket erstellen",
    modalTitle: "Neues Support-Ticket",
  };

  // Formulardaten mit initialSettings oder Default-Werten
  const mergedSettings = {
    ...defaultSettings,
    ...(initialSettings?.messages || {})
  };

  const form = useForm<TicketMessageSettings>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: mergedSettings,
  });

  const onSubmit = async (data: TicketMessageSettings) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/guilds/${serverId}/settings/ticket-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save ticket message settings');
      }

      toast({
        title: "Nachrichteneinstellungen gespeichert",
        description: "Die Ticket-Nachrichteneinstellungen wurden erfolgreich aktualisiert.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving ticket message settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Nachrichteneinstellungen konnten nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket-Nachrichteneinstellungen</CardTitle>
        <CardDescription>
          Passe die Nachrichten an, die Benutzer bei der Erstellung und Verwaltung von Tickets sehen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="buttonLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button-Beschriftung</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={80} />
                  </FormControl>
                  <FormDescription>
                    Text auf dem Button, der zum Öffnen des Ticket-Dialogs dient.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modalTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modal-Titel</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={80} />
                  </FormControl>
                  <FormDescription>
                    Titel des Dialogs zur Ticket-Erstellung.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Willkommensnachricht</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px] resize-y"
                      maxLength={1500}
                    />
                  </FormControl>
                  <FormDescription>
                    Diese Nachricht wird angezeigt, wenn ein Benutzer den Ticket-Dialog öffnet.
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Verfügbare Variablen: {'{user}'}, {'{server}'}, {'{categories}'}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketCreatedMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket-Erstellungsnachricht</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px] resize-y"
                      maxLength={1500}
                    />
                  </FormControl>
                  <FormDescription>
                    Diese Nachricht wird angezeigt, wenn ein neues Ticket erstellt wurde.
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Verfügbare Variablen: {'{user}'}, {'{server}'}, {'{ticket_id}'}, {'{category}'}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketClosedMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket-Schließungsnachricht</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px] resize-y"
                      maxLength={1500}
                    />
                  </FormControl>
                  <FormDescription>
                    Diese Nachricht wird angezeigt, wenn ein Ticket geschlossen wird.
                    <br />
                    <span className="text-xs text-muted-foreground">
                      Verfügbare Variablen: {'{user}'}, {'{server}'}, {'{ticket_id}'}, {'{closed_by}'}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Nachrichteneinstellungen speichern"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
