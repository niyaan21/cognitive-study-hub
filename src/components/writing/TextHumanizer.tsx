
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { openRouterService } from '@/services/openRouterService';
import { Loader2, Sparkles, ArrowRightLeft } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  toneStyle: z.string().min(1, "Please select a tone/style"),
  complexity: z.string().min(1, "Please select complexity"),
  addVariation: z.boolean()
});

const TextHumanizer = () => {
  const [aiText, setAiText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toneStyle: "conversational",
      complexity: "medium",
      addVariation: true
    }
  });

  const handleHumanize = async (data: z.infer<typeof formSchema>) => {
    if (!aiText.trim()) {
      toast.warning("Please enter text to humanize");
      return;
    }

    setIsProcessing(true);
    setHumanizedText('');

    try {
      const prompt = `
        You are an expert at making AI-generated text sound more human-written. Rewrite the following text to make it sound
        naturally human-written with the following characteristics:
        
        - Tone/Style: ${data.toneStyle}
        - Complexity: ${data.complexity}
        - Add natural variations and imperfections: ${data.addVariation ? 'Yes' : 'No'}
        
        If adding variations is enabled, introduce:
        - Occasional filler words or phrases
        - Some sentence fragments where appropriate
        - Varied sentence structures
        - Natural flow with conversational transitions
        - Informal expressions where appropriate
        
        Only rewrite the text, do not add any explanations or notes about what you've changed.
        
        Text to humanize:
        ---
        ${aiText}
        ---
      `;

      const response = await openRouterService.chat([
        { role: 'system', content: "You are an expert at rewriting AI-generated text to sound naturally human-written." },
        { role: 'user', content: prompt }
      ]);

      setHumanizedText(response);
      toast.success("Text successfully humanized!");
    } catch (error) {
      console.error("Text humanization error:", error);
      toast.error("Failed to humanize text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Text Editor
          </TabsTrigger>
          <TabsTrigger value="humanized" className="flex items-center gap-2" disabled={!humanizedText}>
            <Sparkles className="h-4 w-4" />
            Humanized Result
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <Textarea 
                value={aiText} 
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Paste AI-generated text here to humanize..."
                className="min-h-[350px] resize-none"
              />
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {aiText.split(/\s+/).filter(Boolean).length} words
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setAiText('')} disabled={!aiText || isProcessing}>
                    Clear
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(handleHumanize)} 
                    disabled={!aiText || isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      'Humanize Text'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="toneStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone/Style</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isProcessing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone/style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="formal">Formal/Academic</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="creative">Creative/Expressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Complexity</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isProcessing}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple (Easy to understand)</SelectItem>
                              <SelectItem value="medium">Medium (Balanced)</SelectItem>
                              <SelectItem value="complex">Complex (Sophisticated)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addVariation"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                                disabled={isProcessing}
                              />
                            </FormControl>
                            <Label htmlFor="add-variation">Add natural variations</Label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-semibold mb-2">How it works</h3>
                      <p className="text-sm text-muted-foreground">
                        This tool transforms AI-generated text by adding natural human patterns like varied sentence structure, 
                        occasional filler words, and subtle imperfections that make writing feel authentic.
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="humanized">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Humanized Text
              </h3>
              
              <div className="border rounded-md p-4 bg-muted/30 mt-2 min-h-[350px]">
                <div className="whitespace-pre-wrap">{humanizedText}</div>
              </div>
              
              <div className="flex justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {humanizedText.split(/\s+/).filter(Boolean).length} words
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(humanizedText);
                    toast.success("Text copied to clipboard!");
                  }}
                >
                  Copy Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextHumanizer;
