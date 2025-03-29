"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Grip, Settings, Eye, EyeOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schema für die visuellen Einstellungen
const displaySettingsSchema = z.object({
  buttonStyle: z.enum(['default', 'outline', 'secondary', 'primary']),
  buttonSize: z.enum(['default', 'sm', 'lg']),
  displayMode: z.enum(['buttons', 'dropdown', 'modal']),
  visibleCategories: z.array(z.string()),
  categoryOrder: z.array(z.string()),
  showCategoryDescription: z.boolean(),
  showCategoryIcon: z.boolean(),
  customChannelName: z.string().max(100).optional(),
  customEmbedColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

type DisplaySettings = z.infer<typeof displaySettingsSchema>;

// Komponente für einen sortierbaren Kategorie-Eintrag
function SortableCategoryItem({ id, category, visibleCategories, toggleCategoryVisibility }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const isVisible = visibleCategories.includes(id);
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 mb-2 border rounded-lg bg-card"
    >
      <div className="flex items-center gap-2">
        <span {...attributes} {...listeners} className="cursor-grab">
          <Grip className="h-5 w-5 text-muted-foreground" />
        </span>
        <div className="flex flex-col">
          <span className="font-medium">{category.name}</span>
          {category.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {category.description}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleCategoryVisibility(id)}
        className="ml-auto"
      >
        {isVisible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

interface TicketDisplaySettingsProps {
  serverId: string;
  categories: any[];
  initialSettings: any;
}

export default function TicketDisplaySettings({ serverId, categories, initialSettings }: TicketDisplaySettingsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Sensoren für Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Default-Werte für die Display-Einstellungen
  const defaultSettings: DisplaySettings = {
    buttonStyle: 'primary',
    buttonSize: 'default',
    displayMode: 'buttons',
    visibleCategories: categories.map(cat => cat.id), // Standardmäßig alle Kategorien sichtbar
    categoryOrder: categories.map(cat => cat.id), // Standardreihenfolge
    showCategoryDescription: true,
    showCategoryIcon: true,
    customChannelName: 'ticket-{username}',
    customEmbedColor: '#5865F2',
  };

  // Formulardaten mit initialSettings oder Default-Werten
  const mergedSettings = {
    ...defaultSettings,
    ...(initialSettings?.display || {}),
    // Stelle sicher, dass auch neue Kategorien in den Arrays sind
    visibleCategories: [
      ...(initialSettings?.display?.visibleCategories || []),
      ...categories
        .filter(cat => !(initialSettings?.display?.visibleCategories || []).includes(cat.id))
        .map(cat => cat.id)
    ],
    categoryOrder: [
      ...(initialSettings?.display?.categoryOrder || []),
      ...categories
        .filter(cat => !(initialSettings?.display?.categoryOrder || []).includes(cat.id))
        .map(cat => cat.id)
    ],
  };

  const form = useForm<DisplaySettings>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: mergedSettings,
  });

  // Aktuelle Werte im Formular
  const categoryOrder = form.watch('categoryOrder');
  const visibleCategories = form.watch('visibleCategories');
  
  // Kategorie-Sichtbarkeit umschalten
  const toggleCategoryVisibility = (categoryId: string) => {
    const currentVisible = form.getValues('visibleCategories');
    let newVisible;
    
    if (currentVisible.includes(categoryId)) {
      newVisible = currentVisible.filter(id => id !== categoryId);
    } else {
      newVisible = [...currentVisible, categoryId];
    }
    
    form.setValue('visibleCategories', newVisible, { shouldValidate: true });
  };
  
  // Reihenfolge ändern
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = categoryOrder.indexOf(active.id);
      const newIndex = categoryOrder.indexOf(over.id);
      
      const newOrder = arrayMove(categoryOrder, oldIndex, newIndex);
      form.setValue('categoryOrder', newOrder, { shouldValidate: true });
    }
  };

  // Formular absenden
  const onSubmit = async (data: DisplaySettings) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/guilds/${serverId}/settings/ticket-display`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save ticket display settings');
      }

      toast({
        title: "Anzeigeeinstellungen gespeichert",
        description: "Die Ticket-Anzeigeeinstellungen wurden erfolgreich aktualisiert.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving ticket display settings:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Anzeigeeinstellungen konnten nicht gespeichert werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Ordne die Kategorien nach der aktuellen Reihenfolge
  const sortedCategories = categoryOrder
    .map(id => categories.find(cat => cat.id === id))
    .filter(Boolean);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Ticket-Anzeigeeinstellungen</CardTitle>
        <CardDescription>
          Passe das Erscheinungsbild und die Struktur des Ticket-Systems an.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayMode"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Anzeigemodus</FormLabel>
                      <FormDescription>
                        Wie sollen Benutzer Tickets erstellen können?
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="buttons" id="displayMode-buttons" />
                            <label htmlFor="displayMode-buttons">Buttons (Schaltflächen für jede Kategorie)</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dropdown" id="displayMode-dropdown" />
                            <label htmlFor="displayMode-dropdown">Dropdown (Auswahl aus einer Liste)</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="modal" id="displayMode-modal" />
                            <label htmlFor="displayMode-modal">Modal (Dialog mit Kategorien)</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buttonStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button-Stil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wähle einen Stil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Standard</SelectItem>
                            <SelectItem value="primary">Primär</SelectItem>
                            <SelectItem value="secondary">Sekundär</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button-Größe</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wähle eine Größe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Standard</SelectItem>
                            <SelectItem value="sm">Klein</SelectItem>
                            <SelectItem value="lg">Groß</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customChannelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benutzerdefinierter Kanalname</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ticket-{username}" />
                      </FormControl>
                      <FormDescription>
                        Lege fest, wie die Ticket-Kanäle benannt werden sollen.
                        <br />
                        <span className="text-xs text-muted-foreground">
                          Verfügbare Variablen: {'{username}'}, {'{userid}'}, {'{ticketid}'}
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customEmbedColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benutzerdefinierte Embed-Farbe</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="#5865F2"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                        </FormControl>
                        <div
                          className="h-8 w-8 rounded-full border"
                          style={{ backgroundColor: field.value }}
                        />
                      </div>
                      <FormDescription>
                        Farbe der Embeds in HEX-Format (z.B. #5865F2).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="showCategoryDescription"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Kategoriebeschreibungen anzeigen
                          </FormLabel>
                          <FormDescription>
                            Zeigt die Beschreibung jeder Kategorie an.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showCategoryIcon"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Kategorie-Icons anzeigen
                          </FormLabel>
                          <FormDescription>
                            Zeigt Icons für jede Kategorie an.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Kategoriereihenfolge und Sichtbarkeit</h3>
                    <Badge variant="outline" className="ml-auto">
                      {visibleCategories.length} von {categories.length} sichtbar
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ziehe die Kategorien, um ihre Reihenfolge zu ändern. Klicke auf das Auge, um die Sichtbarkeit zu ändern.
                  </p>
                  
                  <ScrollArea className="h-[400px] pr-4">
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext 
                        items={categoryOrder}
                        strategy={verticalListSortingStrategy}
                      >
                        {sortedCategories.map((category) => (
                          <SortableCategoryItem
                            key={category.id}
                            id={category.id}
                            category={category}
                            visibleCategories={visibleCategories}
                            toggleCategoryVisibility={toggleCategoryVisibility}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Anzeigeeinstellungen speichern"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
