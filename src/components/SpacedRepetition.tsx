
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Calendar, Brain, Trophy } from "lucide-react";
import { openRouterService } from '@/services/openRouterService';
import { StudyMaterial } from '@/services/fileProcessorService';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SpacedRepetitionProps {
  material: StudyMaterial | null;
}

interface FlashcardWithMetadata {
  question: string;
  answer: string;
  difficulty: number; // 1-5 scale
  nextReview: Date;
  interval: number; // days until next review
  reviewCount: number;
}

const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({ material }) => {
  const [flashcards, setFlashcards] = useState<FlashcardWithMetadata[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewMode, setReviewMode] = useState<'all' | 'due'>('due');
  const [stats, setStats] = useState({
    mastered: 0,
    learning: 0,
    difficult: 0,
    dueToday: 0,
  });

  // Generate or load flashcards when material changes
  useEffect(() => {
    if (material && flashcards.length === 0) {
      generateFlashcards();
    }
  }, [material]);

  // Calculate stats whenever flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newStats = {
        mastered: flashcards.filter(card => card.difficulty <= 2).length,
        learning: flashcards.filter(card => card.difficulty === 3).length,
        difficult: flashcards.filter(card => card.difficulty >= 4).length,
        dueToday: flashcards.filter(card => {
          const reviewDate = new Date(card.nextReview);
          reviewDate.setHours(0, 0, 0, 0);
          return reviewDate <= today;
        }).length,
      };
      
      setStats(newStats);
    }
  }, [flashcards]);

  const generateFlashcards = async () => {
    if (!material) return;

    setIsGenerating(true);
    try {
      const generatedCards = await openRouterService.generateFlashcards(material.content);
      
      // Add spaced repetition metadata to each card
      const cardsWithMetadata: FlashcardWithMetadata[] = generatedCards.map(card => ({
        ...card,
        difficulty: 3, // Start at medium difficulty
        nextReview: new Date(), // Due immediately
        interval: 1, // Start with 1-day interval
        reviewCount: 0,
      }));
      
      setFlashcards(cardsWithMetadata);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success("Flashcards generated with spaced repetition tracking");
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRating = (difficulty: number) => {
    if (flashcards.length === 0) return;

    // Create a copy of the flashcards
    const updatedFlashcards = [...flashcards];
    const currentCard = updatedFlashcards[currentIndex];
    
    // Update the current card's metadata
    currentCard.difficulty = difficulty;
    currentCard.reviewCount += 1;
    
    // Calculate new interval using SM-2 algorithm (simplified)
    let newInterval = currentCard.interval;
    if (difficulty <= 2) { // Easy
      newInterval = Math.max(currentCard.interval * 2, 1);
    } else if (difficulty === 3) { // Medium
      newInterval = Math.max(currentCard.interval + 1, 1);
    } else { // Hard
      newInterval = 1; // Reset to 1 day
    }
    
    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    currentCard.nextReview = nextReview;
    currentCard.interval = newInterval;
    
    // Update state
    setFlashcards(updatedFlashcards);
    
    // Toast feedback
    if (difficulty <= 2) {
      toast.success("Great job! This card will be shown again in " + newInterval + " days");
    } else if (difficulty === 3) {
      toast.info("You'll review this card again in " + newInterval + " days");
    } else {
      toast.info("We'll review this again tomorrow to help you remember");
    }
    
    // Move to next card
    moveToNextCard();
  };

  const moveToNextCard = () => {
    // Find the next card based on review mode
    if (reviewMode === 'due') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find the next due card after current index
      let nextIndex = -1;
      for (let i = currentIndex + 1; i < flashcards.length; i++) {
        const reviewDate = new Date(flashcards[i].nextReview);
        reviewDate.setHours(0, 0, 0, 0);
        if (reviewDate <= today) {
          nextIndex = i;
          break;
        }
      }
      
      // If not found, look from the beginning
      if (nextIndex === -1) {
        for (let i = 0; i < currentIndex; i++) {
          const reviewDate = new Date(flashcards[i].nextReview);
          reviewDate.setHours(0, 0, 0, 0);
          if (reviewDate <= today) {
            nextIndex = i;
            break;
          }
        }
      }
      
      // If still not found, there are no more due cards
      if (nextIndex === -1) {
        toast.success("You've completed all due cards for today!");
        return;
      }
      
      setCurrentIndex(nextIndex);
    } else {
      // In all mode, just move to next or loop back
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }
    
    setIsFlipped(false);
  };

  const renderDifficultyBadge = (difficulty: number) => {
    if (difficulty <= 2) return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Easy</Badge>
    if (difficulty === 3) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Learning</Badge>
    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Difficult</Badge>
  };

  const calculateMasteryPercentage = () => {
    if (flashcards.length === 0) return 0;
    return Math.round((stats.mastered / flashcards.length) * 100);
  };

  const getDueCards = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return flashcards.filter(card => {
      const reviewDate = new Date(card.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });
  };

  if (!material) {
    return (
      <div className="text-center p-6">
        <p>Please select a study material to start spaced repetition practice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Spaced Repetition</h2>
          <p className="text-muted-foreground">Review cards at optimal intervals to maximize retention</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setReviewMode('due')} variant={reviewMode === 'due' ? "default" : "outline"} size="sm">
            Due Today ({stats.dueToday})
          </Button>
          <Button onClick={() => setReviewMode('all')} variant={reviewMode === 'all' ? "default" : "outline"} size="sm">
            All Cards
          </Button>
          <Button onClick={generateFlashcards} variant="outline" size="sm" disabled={isGenerating}>
            Regenerate
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Flashcard Review</span>
              {flashcards.length > 0 && (
                renderDifficultyBadge(flashcards[currentIndex].difficulty)
              )}
            </CardTitle>
            <CardDescription>
              {reviewMode === 'due' ? 'Reviewing due cards' : 'Reviewing all cards'}
            </CardDescription>
          </CardHeader>
          {isGenerating ? (
            <CardContent className="min-h-[300px] flex items-center justify-center">
              <div className="space-y-4 w-full">
                <Skeleton className="h-8 w-[80%] mx-auto" />
                <Skeleton className="h-4 w-[60%] mx-auto" />
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Generating spaced repetition cards...
                </div>
              </div>
            </CardContent>
          ) : flashcards.length > 0 ? (
            <>
              <CardContent className="min-h-[300px]">
                <Card
                  className="min-h-[250px] cursor-pointer border-dashed hover:border-primary/50 transition-colors"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <CardContent className="p-6 flex items-center justify-center text-center">
                    <div className="text-lg">
                      {isFlipped 
                        ? flashcards[currentIndex].answer 
                        : flashcards[currentIndex].question}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground flex items-center justify-between w-full">
                  <span>Card {currentIndex + 1} of {flashcards.length}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Next review: {isFlipped ? new Date(flashcards[currentIndex].nextReview).toLocaleDateString() : '?'}
                    </span>
                  </div>
                </div>
                
                {isFlipped && (
                  <div className="w-full grid grid-cols-4 gap-2">
                    <Button onClick={() => handleRating(1)} variant="outline" className="border-2 border-green-500/50 hover:bg-green-500/20">
                      Easy
                    </Button>
                    <Button onClick={() => handleRating(2)} variant="outline" className="border-2 border-green-300/50 hover:bg-green-300/20">
                      Good
                    </Button>
                    <Button onClick={() => handleRating(3)} variant="outline" className="border-2 border-yellow-500/50 hover:bg-yellow-500/20">
                      Medium
                    </Button>
                    <Button onClick={() => handleRating(5)} variant="outline" className="border-2 border-red-500/50 hover:bg-red-500/20">
                      Hard
                    </Button>
                  </div>
                )}
              </CardFooter>
            </>
          ) : (
            <CardContent className="min-h-[300px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                No flashcards available. Generate some to start practicing.
              </p>
            </CardContent>
          )}
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Mastery Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall mastery</span>
                  <span>{calculateMasteryPercentage()}%</span>
                </div>
                <Progress value={calculateMasteryPercentage()} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 rounded-md bg-green-500/10">
                  <div className="text-xl font-bold text-green-500">{stats.mastered}</div>
                  <div className="text-xs text-muted-foreground">Mastered</div>
                </div>
                <div className="text-center p-2 rounded-md bg-yellow-500/10">
                  <div className="text-xl font-bold text-yellow-500">{stats.learning}</div>
                  <div className="text-xs text-muted-foreground">Learning</div>
                </div>
                <div className="text-center p-2 rounded-md bg-red-500/10">
                  <div className="text-xl font-bold text-red-500">{stats.difficult}</div>
                  <div className="text-xs text-muted-foreground">Difficult</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>Due for review</span>
                </div>
                <Badge variant="secondary">{stats.dueToday} cards</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetition;
