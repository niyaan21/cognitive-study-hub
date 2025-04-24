
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { fileProcessorService } from '@/services/fileProcessorService';
import { openRouterService } from '@/services/openRouterService';
import { StudyMaterial } from '@/services/fileProcessorService';
import { Download, FileText, Loader2, Sparkles, Save } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface NoteTakingProps {
  onNoteSaved: (note: any) => void;
  autoGenerateFrom?: StudyMaterial;
}

const NoteTaking: React.FC<NoteTakingProps> = ({ onNoteSaved, autoGenerateFrom }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-generate notes if a study material is provided
  useEffect(() => {
    if (autoGenerateFrom && autoGenerateFrom.content) {
      autoGenerateNotes(autoGenerateFrom);
    }
  }, [autoGenerateFrom]);

  const autoGenerateNotes = async (material: StudyMaterial) => {
    setIsAutoGenerating(true);
    try {
      const prompt = `Create comprehensive, well-structured study notes from the following content. 
      Format with clear headers, subheaders, bullet points, and numbered lists where appropriate. 
      Highlight key concepts, definitions, and important takeaways. 
      Organize the information logically and include a brief summary at the beginning. 
      Make it extremely professional and ready for academic use:\n\n${material.content.substring(0, 8000)}`;
      
      const generatedNotes = await openRouterService.chat([
        { role: 'system', content: 'You are an expert academic note-taker with skills in organizing complex information into clear, structured study materials. Create comprehensive notes suitable for university-level students.' },
        { role: 'user', content: prompt }
      ]);
      
      setTitle(`Notes: ${material.name}`);
      setContent(generatedNotes);
      toast.success("Notes automatically generated!");
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const note = await fileProcessorService.createNote(title, content);
      onNoteSaved(note);
      toast.success("Notes saved successfully!");
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!content.trim()) return;
    
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      const fileName = title.trim() || "Study Notes";
      doc.setFontSize(18);
      doc.text(fileName, 20, 20);
      
      // Add content
      doc.setFontSize(12);
      
      // Split content into lines that fit the page width
      const textLines = doc.splitTextToSize(content, 170);
      doc.text(textLines, 20, 30);
      
      // Save the PDF
      doc.save(`${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <FileText className="h-6 w-6 text-primary" />
              Smart Notes
            </CardTitle>
            {isAutoGenerating && (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">AI is working...</span>
              </div>
            )}
          </div>
          <CardDescription className="text-base">
            Create professional study notes with AI assistance. Your notes will be automatically structured and formatted.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Enter a descriptive title for your notes..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isAutoGenerating}
                className="text-lg font-medium h-12 transition-all focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="relative min-h-[400px]">
              <Textarea
                placeholder={isAutoGenerating ? "Generating professional notes..." : "Write your notes here or wait for AI generation..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] text-base leading-relaxed resize-y p-4 transition-all focus-visible:ring-2 focus-visible:ring-primary"
                disabled={isAutoGenerating}
              />
              {isAutoGenerating && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Generating professional study notes...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-muted/10">
          <Button 
            onClick={handleSaveNote} 
            disabled={isSaving || isAutoGenerating || !title.trim() || !content.trim()}
            className="flex-1 h-11"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Notes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Notes
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading || isAutoGenerating || !content.trim()}
            variant="outline"
            className="flex-1 h-11 border-2"
            size="lg"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoteTaking;
