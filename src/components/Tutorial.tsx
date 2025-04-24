
import React from 'react';
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
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {tutorialSteps[currentStep].title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[200px] rounded-md border p-4">
          <DialogDescription className="text-base leading-relaxed">
            {tutorialSteps[currentStep].description}
          </DialogDescription>
        </ScrollArea>
        <DialogFooter className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          <Button onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Tutorial;
