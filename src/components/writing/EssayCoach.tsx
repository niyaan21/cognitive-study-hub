
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { openRouterService } from '@/services/openRouterService';
import { Loader2, BookOpen, Info, MessageSquare, FileText, PenTool } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  essayType: z.string().min(1, "Please select an essay type"),
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  audience: z.string().min(1, "Please select an audience"),
  toneStyle: z.string().min(1, "Please select a tone/style"),
  wordCount: z.string().min(1, "Please specify word count")
});

const EssayCoach = () => {
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState('');
  const [outline, setOutline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('essay');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essayType: "",
      topic: "",
      audience: "",
      toneStyle: "",
      wordCount: "500"
    }
  });

  const handleAnalyze = async () => {
    if (essay.trim().length < 50) {
      toast.warning("Please enter a longer essay for proper analysis");
      return;
    }

    setIsAnalyzing(true);
    setFeedback('');

    try {
      const response = await openRouterService.chat([
        { 
          role: 'system', 
          content: `You are an expert writing coach specializing in essay feedback. 
                   Analyze the essay and provide detailed, constructive feedback on:
                   1. Structure and organization
                   2. Thesis statement and argument development
                   3. Evidence and support
                   4. Style and tone
                   5. Grammar and mechanics
                   
                   Format your response in markdown with clear sections and specific examples from the text.
                   End with 3 concrete suggestions for improvement.`
        },
        { role: 'user', content: essay }
      ]);

      setFeedback(response);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Essay analysis error:", error);
      toast.error("Failed to analyze essay. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOutline = async (data: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setOutline('');

    try {
      const prompt = `
        Create a detailed essay outline for the following parameters:
        - Type of essay: ${data.essayType}
        - Topic: ${data.topic}
        - Target audience: ${data.audience}
        - Tone/Style: ${data.toneStyle}
        - Word count: approximately ${data.wordCount} words
        
        Include:
        1. A compelling thesis statement
        2. Main sections with key points
        3. Where to incorporate evidence/examples
        4. Suggestions for introduction and conclusion
        
        Format in markdown with clear hierarchy.
      `;

      const response = await openRouterService.chat([
        { role: 'system', content: "You are an expert writing coach specializing in essay structure and organization." },
        { role: 'user', content: prompt }
      ]);

      setOutline(response);
      setActiveTab('outline');
      toast.success("Outline generated!");
    } catch (error) {
      console.error("Outline generation error:", error);
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue="essay" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="essay" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Essay Editor
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Outline Generator
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2" disabled={!feedback}>
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="essay">
          <div className="space-y-4">
            <Textarea 
              value={essay} 
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write or paste your essay here..."
              className="min-h-[400px]"
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {essay.split(/\s+/).filter(Boolean).length} words
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setEssay('')} disabled={!essay || isAnalyzing}>
                  Clear
                </Button>
                <Button onClick={handleAnalyze} disabled={essay.length < 50 || isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    'Get Feedback'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="outline">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenTool className="h-5 w-5" /> Essay Requirements
                </CardTitle>
                <CardDescription>
                  Provide details to generate a custom essay outline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleGenerateOutline)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="essayType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Essay Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select essay type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="argumentative">Argumentative</SelectItem>
                              <SelectItem value="expository">Expository</SelectItem>
                              <SelectItem value="narrative">Narrative</SelectItem>
                              <SelectItem value="descriptive">Descriptive</SelectItem>
                              <SelectItem value="compare-contrast">Compare & Contrast</SelectItem>
                              <SelectItem value="persuasive">Persuasive</SelectItem>
                              <SelectItem value="analytical">Analytical</SelectItem>
                              <SelectItem value="research">Research</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Essay Topic</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your essay topic" {...field} disabled={isGenerating} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="academic">Academic (professors/teachers)</SelectItem>
                              <SelectItem value="professional">Professional/Business</SelectItem>
                              <SelectItem value="general">General Public</SelectItem>
                              <SelectItem value="students">Students</SelectItem>
                              <SelectItem value="technical">Technical Experts</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="toneStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone/Style</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone/style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="formal">Formal/Academic</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="persuasive">Persuasive</SelectItem>
                              <SelectItem value="informative">Informative</SelectItem>
                              <SelectItem value="analytical">Analytical</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wordCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approximate Word Count</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select word count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="250">Short (~250 words)</SelectItem>
                              <SelectItem value="500">Medium (~500 words)</SelectItem>
                              <SelectItem value="750">Long (~750 words)</SelectItem>
                              <SelectItem value="1000">Extended (~1000 words)</SelectItem>
                              <SelectItem value="1500">Research Paper (~1500 words)</SelectItem>
                              <SelectItem value="2500">Thesis (~2500 words)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                      ) : (
                        'Generate Outline'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Essay Outline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {outline ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: outline.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-2 text-muted-foreground">
                    <Info className="h-12 w-12" />
                    <p>Fill out the form and click "Generate Outline" to create a custom essay structure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Essay Feedback</CardTitle>
              <CardDescription>
                Professional assessment and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No feedback available yet. Analyze your essay to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EssayCoach;
