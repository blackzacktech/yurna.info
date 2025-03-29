"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrashIcon, PlusIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Question {
  id?: string;
  label: string;
  placeholder?: string;
  required: boolean;
  type: 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'SELECT';
  options?: string[];
  order: number;
}

interface TicketCategoryQuestionsProps {
  serverId: string;
  categoryId: number;
  initialQuestions?: Question[];
  readOnly?: boolean;
}

export default function TicketCategoryQuestions({
  serverId,
  categoryId,
  initialQuestions = [],
  readOnly = false
}: TicketCategoryQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    } else {
      loadQuestions();
    }
  }, [categoryId]);

  async function loadQuestions() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Fragen');
      }
      
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Fehler beim Laden der Fragen:', error);
      toast({
        title: 'Fehler',
        description: 'Die Fragen konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveQuestions() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tickets/${serverId}/categories/${categoryId}/questions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Fragen');
      }
      
      toast({
        title: 'Erfolg',
        description: 'Die Fragen wurden erfolgreich gespeichert.',
        variant: 'default'
      });
      
      loadQuestions(); // Neuladen der Fragen
    } catch (error) {
      console.error('Fehler beim Speichern der Fragen:', error);
      toast({
        title: 'Fehler',
        description: 'Die Fragen konnten nicht gespeichert werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  function addQuestion() {
    const newQuestion: Question = {
      label: 'Neue Frage',
      required: true,
      type: 'TEXT',
      placeholder: '',
      order: questions.length + 1
    };
    
    setQuestions([...questions, newQuestion]);
  }

  function removeQuestion(index: number) {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    
    // Aktualisieren der Reihenfolge
    newQuestions.forEach((q, i) => {
      q.order = i + 1;
    });
    
    setQuestions(newQuestions);
  }

  function updateQuestion(index: number, data: Partial<Question>) {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      ...data
    };
    setQuestions(newQuestions);
  }

  function moveQuestion(index: number, direction: 'up' | 'down') {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order properties
    const tempOrder = newQuestions[index].order;
    newQuestions[index].order = newQuestions[swapIndex].order;
    newQuestions[swapIndex].order = tempOrder;
    
    // Swap positions in array
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    
    setQuestions(newQuestions);
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(newQuestions);
  }

  function addOption(questionIndex: number) {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options!.push('Neue Option');
    setQuestions(newQuestions);
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options!.splice(optionIndex, 1);
    setQuestions(newQuestions);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ticket-Fragen</h3>
        {!readOnly && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={addQuestion}
              disabled={isLoading}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Frage hinzufügen
            </Button>
            <Button 
              onClick={saveQuestions}
              disabled={isLoading}
            >
              Speichern
            </Button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {isLoading ? 'Fragen werden geladen...' : 'Keine Fragen vorhanden'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id || `new-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Frage {index + 1}</CardTitle>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronsUpDownIcon className="w-4 h-4 rotate-180" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        <ChevronsUpDownIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <TrashIcon className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`question-${index}-label`}>Fragetext</Label>
                  <Input
                    id={`question-${index}-label`}
                    value={question.label}
                    onChange={(e) => updateQuestion(index, { label: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`question-${index}-type`}>Typ</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion(index, { 
                      type: value as 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'SELECT' 
                    })}
                    disabled={readOnly}
                  >
                    <SelectTrigger id={`question-${index}-type`}>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Einzeiliger Text</SelectItem>
                      <SelectItem value="TEXTAREA">Mehrzeiliger Text</SelectItem>
                      <SelectItem value="NUMBER">Zahl</SelectItem>
                      <SelectItem value="SELECT">Auswahlmenü</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`question-${index}-placeholder`}>Platzhalter (optional)</Label>
                  <Input
                    id={`question-${index}-placeholder`}
                    value={question.placeholder || ''}
                    onChange={(e) => updateQuestion(index, { placeholder: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                
                {question.type === 'SELECT' && (
                  <div className="space-y-2">
                    <Label>Optionen</Label>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={`option-${index}-${optIndex}`} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            disabled={readOnly}
                          />
                          {!readOnly && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeOption(index, optIndex)}
                            >
                              <TrashIcon className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {!readOnly && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addOption(index)}
                          className="mt-2"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Option hinzufügen
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`question-${index}-required`}>Erforderlich</Label>
                  <Switch
                    id={`question-${index}-required`}
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion(index, { required: checked })}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!readOnly && questions.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={saveQuestions} disabled={isLoading}>
            Alle Fragen speichern
          </Button>
        </div>
      )}
    </div>
  );
}
