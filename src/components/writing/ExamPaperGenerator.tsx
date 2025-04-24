
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { openRouterService } from '@/services/openRouterService';
import { Loader2, FileText, BookOpen, Settings } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { StudyMaterial } from '@/services/fileProcessorService';
import { storageService } from '@/services/storageService';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

interface ExamPaper {
  title: string;
  introduction: string;
  sections: {
    title: string;
    description: string;
    questions: Question[];
  }[];
  timeAllocation: string;
  totalPoints: number;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subjectArea: z.string().min(1, "Please select a subject area"),
  difficultyLevel: z.string().min(1, "Please select difficulty"),
  examType: z.string().min(1, "Please select an exam type"),
  questionCount: z.string().min(1, "Please specify question count"),
  timeLimit: z.string().min(1, "Please specify time limit"),
  includeAnswers: z.boolean().default(true)
});

const ExamPaperGenerator = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [customContent, setCustomContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [examPaper, setExamPaper] = useState<ExamPaper | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subjectArea: "",
      difficultyLevel: "medium",
      examType: "mixed",
      questionCount: "10",
      timeLimit: "60",
      includeAnswers: true
    }
  });
  
  // Load all study materials from all sessions
  React.useEffect(() => {
    const sessions = storageService.getSessions();
    const allMaterials: StudyMaterial[] = [];
    
    sessions.forEach(session => {
      if (session.materials) {
        allMaterials.push(...session.materials);
      }
    });
    
    setMaterials(allMaterials);
  }, []);

  const handleGenerateExam = async (data: z.infer<typeof formSchema>) => {
    if (!selectedMaterial && !customContent.trim()) {
      toast.warning("Please select study material or provide custom content");
      return;
    }

    setIsGenerating(true);
    setExamPaper(null);

    try {
      const contentToUse = selectedMaterial ? selectedMaterial.content : customContent;
      
      const prompt = `
        Generate an exam paper with the following specifications:
        
        - Title: ${data.title}
        - Subject Area: ${data.subjectArea}
        - Difficulty Level: ${data.difficultyLevel}
        - Exam Type: ${data.examType}
        - Number of Questions: ${data.questionCount}
        - Time Limit: ${data.timeLimit} minutes
        - Include Answer Key: ${data.includeAnswers ? 'Yes' : 'No'}
        
        Based on the following study material:
        ---
        ${contentToUse}
        ---
        
        Create an exam paper in JSON format with this structure:
        {
          "title": "Exam title",
          "introduction": "Brief introduction for students",
          "sections": [
            {
              "title": "Section title",
              "description": "Section description",
              "questions": [
                {
                  "id": "1",
                  "type": "multiple-choice|short-answer|essay|true-false",
                  "question": "Question text",
                  "options": ["Option A", "Option B", "Option C", "Option D"], // For multiple choice
                  "answer": "Correct answer or reference answer",
                  "points": 5,
                  "difficulty": "easy|medium|hard",
                  "explanation": "Explanation of the answer"
                }
              ]
            }
          ],
          "timeAllocation": "Time allocated for the exam",
          "totalPoints": 100
        }
        
        Use a mix of question types based on the exam type specified, ensure questions are directly based on
        the provided study material, and match the difficulty level requested.
      `;

      const response = await openRouterService.chat([
        { role: 'system', content: "You are an expert educational exam creator with expertise in creating well-structured assessment papers." },
        { role: 'user', content: prompt }
      ]);

      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        if (data && data.title && data.sections) {
          setExamPaper(data);
          toast.success("Exam paper generated successfully!");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        console.error("Failed to parse exam paper:", parseError);
        toast.error("Failed to generate exam paper. Please try again.");
      }
    } catch (error) {
      console.error("Exam generation error:", error);
      toast.error("Failed to generate exam paper. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Exam Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!examPaper}>
            <FileText className="h-4 w-4" />
            Preview Exam
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Content Source</CardTitle>
                <CardDescription>
                  Choose study material or enter custom content to generate exam questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Study Materials</label>
                    <Select 
                      value={selectedMaterial ? selectedMaterial.id : ""}
                      onValueChange={(value) => {
                        const material = materials.find(m => m.id === value);
                        setSelectedMaterial(material || null);
                        if (material) setCustomContent('');
                      }}
                      disabled={isGenerating || customContent.length > 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select study material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.length === 0 ? (
                          <SelectItem value="no-materials" disabled>
                            No study materials available
                          </SelectItem>
                        ) : (
                          materials.map(material => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name} ({material.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Content</label>
                    <Textarea 
                      value={customContent} 
                      onChange={(e) => {
                        setCustomContent(e.target.value);
                        if (e.target.value) setSelectedMaterial(null);
                      }}
                      placeholder="Paste your custom content here to generate exam questions..."
                      className="min-h-[200px]"
                      disabled={isGenerating || selectedMaterial !== null}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedMaterial && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Material Preview</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedMaterial.content.slice(0, 1000)}
                    {selectedMaterial.content.length > 1000 && '...'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Exam Configuration</CardTitle>
              <CardDescription>Customize your exam parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter exam title" {...field} disabled={isGenerating} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subjectArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Area</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject area" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="literature">Literature</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="computer-science">Computer Science</SelectItem>
                              <SelectItem value="language">Language</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="medical">Medical/Health</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficultyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy (Basic concepts)</SelectItem>
                              <SelectItem value="medium">Medium (Average difficulty)</SelectItem>
                              <SelectItem value="hard">Hard (Advanced concepts)</SelectItem>
                              <SelectItem value="mixed">Mixed (Range of difficulties)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exam type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice Only</SelectItem>
                              <SelectItem value="short-answer">Short Answer Only</SelectItem>
                              <SelectItem value="essay">Essay Questions Only</SelectItem>
                              <SelectItem value="true-false">True/False Only</SelectItem>
                              <SelectItem value="mixed">Mixed Question Types</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="questionCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5 Questions</SelectItem>
                              <SelectItem value="10">10 Questions</SelectItem>
                              <SelectItem value="15">15 Questions</SelectItem>
                              <SelectItem value="20">20 Questions</SelectItem>
                              <SelectItem value="25">25 Questions</SelectItem>
                              <SelectItem value="30">30 Questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isGenerating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time limit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                              <SelectItem value="90">90 minutes (1.5 hours)</SelectItem>
                              <SelectItem value="120">120 minutes (2 hours)</SelectItem>
                              <SelectItem value="180">180 minutes (3 hours)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="includeAnswers"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Include Answer Key</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isGenerating}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleGenerateExam)}
                    className="w-full"
                    disabled={isGenerating || (!selectedMaterial && !customContent)}
                  >
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Exam...</>
                    ) : (
                      'Generate Exam Paper'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {examPaper && (
            <div className="space-y-6">
              <Card className="print:shadow-none">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center space-y-2 border-b pb-4">
                      <h1 className="text-2xl font-bold">{examPaper.title}</h1>
                      <p className="text-muted-foreground">{examPaper.timeAllocation} | Total Points: {examPaper.totalPoints}</p>
                      <p className="text-sm">{examPaper.introduction}</p>
                    </div>

                    {examPaper.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-4">
                        <h2 className="text-xl font-semibold">{section.title}</h2>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                        
                        <div className="space-y-6">
                          {section.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="border rounded-md p-4">
                              <div className="flex justify-between mb-2">
                                <h3 className="font-medium">Question {question.id}</h3>
                                <span className="text-sm text-muted-foreground">{question.points} points</span>
                              </div>
                              
                              <p className="mb-4">{question.question}</p>
                              
                              {question.type === 'multiple-choice' && question.options && (
                                <div className="space-y-2 ml-4">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </div>
                                      <p>{option}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.type === 'true-false' && (
                                <div className="space-y-2 ml-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                                      T
                                    </div>
                                    <p>True</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                                      F
                                    </div>
                                    <p>False</p>
                                  </div>
                                </div>
                              )}
                              
                              {(question.type === 'short-answer' || question.type === 'essay') && (
                                <div className="border-t border-dashed mt-2 pt-2">
                                  <p className="text-sm text-muted-foreground italic">
                                    {question.type === 'short-answer' 
                                      ? 'Write a brief answer below' 
                                      : 'Write your essay response below'}
                                  </p>
                                </div>
                              )}
                              
                              {form.getValues().includeAnswers && (
                                <Accordion type="single" collapsible className="mt-4">
                                  <AccordionItem value="answer">
                                    <AccordionTrigger className="text-sm">
                                      Show Answer
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="bg-muted/30 p-2 rounded">
                                        <p className="font-medium">Answer: {question.answer}</p>
                                        {question.explanation && (
                                          <p className="text-sm text-muted-foreground mt-2">
                                            Explanation: {question.explanation}
                                          </p>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    window.print();
                  }}
                >
                  Print Exam
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Logic to download as PDF would be implemented here
                    toast.info("PDF download feature coming soon!");
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamPaperGenerator;
