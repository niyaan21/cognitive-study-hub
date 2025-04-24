import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { StudyMaterial } from '@/services/fileProcessorService';
import { spacedRepetitionService, FlashCard } from '@/services/spacedRepetitionService';
import { toast } from "@/components/ui/sonner";
import { Brain, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Loader2, Star, Zap } from "lucide-react";
import { DayContent } from "react-day-picker";

interface SpacedRepetitionProps {
  material: StudyMaterial | null;
}

const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({ material }) => {
  const [activeTab, setActiveTab] = useState<string>("review");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [dueCards, setDueCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reviewInProgress, setReviewInProgress] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [cardsCompleted, setCardsCompleted] = useState<number>(0);
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [upcomingReviews, setUpcomingReviews] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (material) {
      loadFlashcards();
    } else {
      setFlashcards([]);
      setDueCards([]);
    }
  }, [material]);

  useEffect(() => {
    // Calculate upcoming reviews
    const upcoming: {[key: string]: number} = {};
    flashcards.forEach(card => {
      const dateStr = card.nextReviewDate.toISOString().split('T')[0];
      upcoming[dateStr] = (upcoming[dateStr] || 0) + 1;
    });
    setUpcomingReviews(upcoming);
  }, [flashcards]);

  const loadFlashcards = () => {
    if (!material) return;
    
    const allCards = spacedRepetitionService.getFlashcards(material.id);
    setFlashcards(allCards);
    
    const due = spacedRepetitionService.getDueFlashcards(material.id);
    setDueCards(due);
  };

  const handleGenerateFlashcards = async () => {
    if (!material) {
      toast.error("No study material selected");
      return;
    }
    
    try {
      setIsGenerating(true);
      const newCards = await spacedRepetitionService.generateFlashcardsFromMaterial(material.id, material.content);
      
      toast.success(`Generated ${newCards.length} flashcards`, {
        description: "Ready for review",
      });
      
      loadFlashcards();
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards", {
        description: "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startReviewSession = () => {
    if (dueCards.length === 0) {
      toast.info("No cards due for review");
      return;
    }
    
    setReviewInProgress(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCardsCompleted(0);
    setSessionStartTime(Date.now());
  };

  const endReviewSession = () => {
    if (sessionStartTime && cardsCompleted > 0) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000); // in seconds
      spacedRepetitionService.recordSession({
        materialId: material?.id || '',
        cardsCompleted,
        totalCards: dueCards.length,
        duration
      });
      
      toast.success("Review session completed", {
        description: `You reviewed ${cardsCompleted} cards in ${formatDuration(duration)}`,
      });
    }
    
    setReviewInProgress(false);
    setSessionStartTime(null);
    loadFlashcards(); // Refresh card data
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardReview = (score: number) => {
    if (currentCardIndex >= dueCards.length) return;
    
    const currentCard = dueCards[currentCardIndex];
    spacedRepetitionService.reviewFlashcard(currentCard.id, score);
    
    setCardsCompleted(prev => prev + 1);
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      endReviewSession();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get review dates with card counts
  const getDatesWithReviews = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return upcomingReviews[dateStr] || 0;
  };

  const renderDayContent = (day: React.ComponentProps<typeof DayContent>["day"]) => {
    const count = getDatesWithReviews(day);
    return (
      <div className="relative">
        <div>{day.getDate()}</div>
        {count > 0 && (
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
            count < 3 ? 'bg-blue-400' : 
            count < 7 ? 'bg-amber-400' : 'bg-red-400'
          }`} />
        )}
      </div>
    );
  };

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Brain className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Select Study Material</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please select a study material from your library to start spaced repetition learning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Spaced Repetition</h2>
          <p className="text-muted-foreground">
            Review {material.name} using scientifically optimized intervals
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Generate Flashcards
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Study</span>
            {dueCards.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {dueCards.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Progress</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="review" className="space-y-4">
          {reviewInProgress ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">
                    Card {currentCardIndex + 1} of {dueCards.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={endReviewSession}>
                  End Session
                </Button>
              </div>
              
              <Progress value={(currentCardIndex / dueCards.length) * 100} className="h-2" />
              
              <Card className="w-full mx-auto max-w-3xl h-[300px] relative perspective">
                <div 
                  className={`absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  onClick={handleCardFlip}
                >
                  <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden">
                    <CardHeader>
                      <CardTitle className="text-center">Question</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center text-center">
                      <p className="text-lg">{dueCards[currentCardIndex]?.question}</p>
                    </CardContent>
                    <CardFooter className="flex justify-center text-sm text-muted-foreground">
                      Click to reveal answer
                    </CardFooter>
                  </div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden rotate-y-180">
                    <CardHeader>
                      <CardTitle className="text-center">Answer</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center text-center">
                      <p className="text-lg">{dueCards[currentCardIndex]?.answer}</p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        How well did you remember this?
                      </p>
                    </CardFooter>
                  </div>
                </div>
              </Card>
              
              {isFlipped && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                    onClick={() => handleCardReview(0)}
                  >
                    Not at all
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500"
                    onClick={() => handleCardReview(2)}
                  >
                    With difficulty
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                    onClick={() => handleCardReview(3)}
                  >
                    After hesitation
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                    onClick={() => handleCardReview(5)}
                  >
                    Perfectly
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {flashcards.length > 0 ? (
                <>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <Card className="w-full md:w-2/3">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span>Due for review</span>
                          <Badge variant="secondary" className="ml-auto">
                            {dueCards.length} cards
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Cards that need your attention today
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {dueCards.length > 0 ? (
                          <div className="space-y-2">
                            {dueCards.slice(0, 3).map((card) => (
                              <div 
                                key={card.id} 
                                className="p-3 border rounded-md flex justify-between items-center"
                              >
                                <div className="truncate max-w-[70%]">{card.question}</div>
                                <Badge variant={
                                  card.difficultyLevel <= 2 ? "outline" : 
                                  card.difficultyLevel === 3 ? "secondary" : "default"
                                }>
                                  {card.difficultyLevel <= 2 ? "Easy" : 
                                   card.difficultyLevel === 3 ? "Medium" : "Hard"}
                                </Badge>
                              </div>
                            ))}
                            {dueCards.length > 3 && (
                              <p className="text-sm text-muted-foreground text-center">
                                And {dueCards.length - 3} more cards...
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <p className="text-muted-foreground">
                              No cards due for review today
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          disabled={dueCards.length === 0}
                          onClick={startReviewSession}
                        >
                          Start Review Session
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="w-full md:w-1/3">
                      <CardHeader>
                        <CardTitle>Flashcards</CardTitle>
                        <CardDescription>
                          You have {flashcards.length} flashcards for this material
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Easy cards</span>
                            <span className="font-medium">
                              {flashcards.filter(c => c.difficultyLevel <= 2).length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Medium cards</span>
                            <span className="font-medium">
                              {flashcards.filter(c => c.difficultyLevel === 3).length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Hard cards</span>
                            <span className="font-medium">
                              {flashcards.filter(c => c.difficultyLevel >= 4).length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg space-y-4">
                  <Brain className="h-12 w-12 text-muted-foreground/50" />
                  <div className="text-center">
                    <h3 className="font-medium">No flashcards found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate flashcards to start learning with spaced repetition
                    </p>
                  </div>
                  <Button onClick={handleGenerateFlashcards} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Flashcards"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Review Calendar</CardTitle>
                <CardDescription>
                  Upcoming reviews for {material.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="mx-auto"
                  components={{
                    DayContent: ({ day, ...props }) => {
                      const count = getDatesWithReviews(day);
                      return (
                        <div className="relative">
                          {day.getDate()}
                          {count > 0 && (
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                              count < 3 ? 'bg-blue-400' : 
                              count < 7 ? 'bg-amber-400' : 'bg-red-400'
                            }`} />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Upcoming Reviews</CardTitle>
                <CardDescription>
                  Review schedule for the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(upcomingReviews).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(upcomingReviews)
                      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                      .slice(0, 7)
                      .map(([dateStr, count]) => {
                        const date = new Date(dateStr);
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;
                        return (
                          <div 
                            key={dateStr} 
                            className={`p-3 border rounded-md flex justify-between items-center ${
                              isToday ? 'bg-primary/5 border-primary/30' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex flex-col justify-center items-center w-10 h-10 rounded-full ${
                                isToday ? 'bg-primary/10 text-primary' : 'bg-muted'
                              }`}>
                                <span className="text-xs font-medium">{date.toLocaleDateString('en-US', {month: 'short'})}</span>
                                <span className="text-sm font-bold">{date.getDate()}</span>
                              </div>
                              <span className="font-medium">
                                {isToday ? 'Today' : formatDate(date)}
                              </span>
                            </div>
                            <Badge>
                              {count} card{count !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No upcoming reviews scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Your spaced repetition statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cards</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="text-2xl font-bold">{flashcards.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cards Mastered</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="text-2xl font-bold">
                          {flashcards.filter(card => card.repetitionCount >= 3).length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Review Sessions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        <div className="text-2xl font-bold">
                          {spacedRepetitionService.getSessions().filter(s => s.materialId === material.id).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Card Difficulty Distribution</h4>
                    <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
                      {flashcards.length > 0 && (
                        <div className="flex h-full">
                          <div 
                            className="bg-green-500" 
                            style={{ 
                              width: `${(flashcards.filter(c => c.difficultyLevel <= 2).length / flashcards.length) * 100}%` 
                            }}
                          />
                          <div 
                            className="bg-amber-500" 
                            style={{ 
                              width: `${(flashcards.filter(c => c.difficultyLevel === 3).length / flashcards.length) * 100}%` 
                            }}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ 
                              width: `${(flashcards.filter(c => c.difficultyLevel >= 4).length / flashcards.length) * 100}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Easy</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>Hard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {spacedRepetitionService.getSessions()
                  .filter(s => s.materialId === material.id)
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 5)
                  .map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {session.cardsCompleted} cards reviewed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.date.toLocaleDateString()} • {formatDuration(session.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        {Math.round((session.cardsCompleted / session.totalCards) * 100)}% completed
                      </div>
                    </div>
                  ))}
                  
                {spacedRepetitionService.getSessions().filter(s => s.materialId === material.id).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No review sessions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpacedRepetition;
