
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TutorialStep {
  title: string;
  description: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to AI Study Hub",
    description: "Let's walk through the main features to help you get started with your study journey.",
  },
  {
    title: "Upload Study Materials",
    description: "Start by uploading your study materials - PDFs, documents, or images. You can also browse webpages or use OCR for printed materials.",
  },
  {
    title: "AI-Powered Study Tools",
    description: "Use the AI chat to ask questions about your materials, create flashcards for memorization, or generate summaries to better understand the content.",
  },
  {
    title: "Smart Spaced Repetition",
    description: "Our AI-powered spaced repetition system tracks your learning progress and schedules review sessions at optimal intervals to maximize long-term retention.",
  },
  {
    title: "Study Library",
    description: "Access all your uploaded materials and AI-generated content in one place. Organize them into study sessions for better management.",
  },
  {
    title: "Dark Mode",
    description: "Toggle between light and dark mode using the theme switch in the top right corner for comfortable studying day or night.",
  }
];

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Tutorial = ({ open, onOpenChange }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentStep + 1) / tutorialSteps.length) * 100);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {tutorialSteps[currentStep].title}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <Progress value={progress} className="h-2 mb-4" />
          
          <ScrollArea className="mt-2 h-[200px] rounded-md">
            <DialogDescription className="text-base leading-relaxed">
              {tutorialSteps[currentStep].description}
            </DialogDescription>
          </ScrollArea>
        </div>
        
        <DialogFooter className="px-6 pb-6 pt-2 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          
          <Button onClick={handleNext} className="flex items-center gap-1">
            {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
            {currentStep < tutorialSteps.length - 1 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Tutorial;
