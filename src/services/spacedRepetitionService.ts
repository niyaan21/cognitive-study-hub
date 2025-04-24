
import { v4 as uuidv4 } from 'uuid';
import { openRouterService } from './openRouterService';

// Represents a flashcard for spaced repetition
export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  materialId: string;
  difficultyLevel: number; // 1-5, where 1 is easiest and 5 is hardest
  nextReviewDate: Date;
  lastReviewDate?: Date;
  repetitionCount: number;
  easeFactor: number; // SM-2 algorithm parameter
  intervalDays: number; // Days until next review
}

// Represents a study session for spaced repetition
export interface SpacedRepetitionSession {
  id: string;
  userId?: string;
  materialId: string;
  cardsCompleted: number;
  totalCards: number;
  date: Date;
  duration: number; // in seconds
}

export class SpacedRepetitionService {
  private readonly FLASHCARDS_STORAGE_KEY = 'ai_study_flashcards';
  private readonly SESSIONS_STORAGE_KEY = 'ai_study_spaced_rep_sessions';

  // Get all flashcards
  getFlashcards(materialId?: string): FlashCard[] {
    try {
      const cardsJson = localStorage.getItem(this.FLASHCARDS_STORAGE_KEY);
      if (!cardsJson) {
        return [];
      }

      const cards = JSON.parse(cardsJson) as FlashCard[];
      
      // Convert string dates back to Date objects
      const processedCards = cards.map(card => ({
        ...card,
        nextReviewDate: new Date(card.nextReviewDate),
        lastReviewDate: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined
      }));
      
      // Filter by materialId if provided
      if (materialId) {
        return processedCards.filter(card => card.materialId === materialId);
      }
      
      return processedCards;
    } catch (error) {
      console.error('Error retrieving flashcards:', error);
      return [];
    }
  }

  // Get due flashcards for today
  getDueFlashcards(materialId?: string): FlashCard[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allCards = this.getFlashcards(materialId);
    return allCards.filter(card => {
      const reviewDate = new Date(card.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });
  }

  // Add a flashcard
  addFlashcard(flashcard: Omit<FlashCard, 'id' | 'nextReviewDate' | 'repetitionCount' | 'easeFactor' | 'intervalDays'>): FlashCard {
    const cards = this.getFlashcards();
    
    const newCard: FlashCard = {
      ...flashcard,
      id: uuidv4(),
      nextReviewDate: new Date(), // Due immediately for first review
      repetitionCount: 0,
      easeFactor: 2.5, // Initial ease factor (SM-2 algorithm)
      intervalDays: 0
    };
    
    cards.push(newCard);
    this.saveFlashcards(cards);
    
    return newCard;
  }

  // Update a flashcard
  updateFlashcard(flashcard: FlashCard): FlashCard {
    const cards = this.getFlashcards();
    const index = cards.findIndex(c => c.id === flashcard.id);
    
    if (index >= 0) {
      cards[index] = flashcard;
      this.saveFlashcards(cards);
      return flashcard;
    }
    
    throw new Error(`Flashcard with ID ${flashcard.id} not found`);
  }

  // Delete a flashcard
  deleteFlashcard(id: string): void {
    const cards = this.getFlashcards();
    const updatedCards = cards.filter(card => card.id !== id);
    this.saveFlashcards(updatedCards);
  }

  // Delete all flashcards for a material
  deleteFlashcardsByMaterial(materialId: string): void {
    const cards = this.getFlashcards();
    const updatedCards = cards.filter(card => card.materialId !== materialId);
    this.saveFlashcards(updatedCards);
  }

  // Save flashcards to storage
  private saveFlashcards(cards: FlashCard[]): void {
    try {
      localStorage.setItem(this.FLASHCARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving flashcards:', error);
      throw error;
    }
  }

  // Process flashcard review using SM-2 algorithm
  reviewFlashcard(id: string, performance: number): FlashCard {
    // performance score: 0-5 where:
    // 0 = complete blackout, 
    // 1 = incorrect response but upon seeing answer, it felt familiar
    // 2 = incorrect response but upon seeing answer, it was easy to recall
    // 3 = correct answer but required significant effort to recall
    // 4 = correct answer after hesitation
    // 5 = perfect recall

    if (performance < 0 || performance > 5) {
      throw new Error('Performance score must be between 0 and 5');
    }
    
    const cards = this.getFlashcards();
    const cardIndex = cards.findIndex(c => c.id === id);
    
    if (cardIndex < 0) {
      throw new Error(`Flashcard with ID ${id} not found`);
    }
    
    const card = { ...cards[cardIndex] };
    
    // Apply SM-2 algorithm to calculate next review date
    if (performance < 3) {
      // If rating is less than 3, reset repetition count and interval
      card.repetitionCount = 0;
      card.intervalDays = 1;
    } else {
      // Update ease factor
      card.easeFactor = Math.max(
        1.3, // Minimum ease factor
        card.easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02))
      );
      
      if (card.repetitionCount === 0) {
        card.intervalDays = 1;
      } else if (card.repetitionCount === 1) {
        card.intervalDays = 6;
      } else {
        card.intervalDays = Math.round(card.intervalDays * card.easeFactor);
      }
      
      card.repetitionCount++;
    }
    
    // Update review dates
    card.lastReviewDate = new Date();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.intervalDays);
    card.nextReviewDate = nextDate;
    
    // Update the card
    cards[cardIndex] = card;
    this.saveFlashcards(cards);
    
    return card;
  }

  // Record a study session
  recordSession(session: Omit<SpacedRepetitionSession, 'id' | 'date'>): SpacedRepetitionSession {
    const sessions = this.getSessions();
    
    const newSession: SpacedRepetitionSession = {
      ...session,
      id: uuidv4(),
      date: new Date()
    };
    
    sessions.push(newSession);
    this.saveSessions(sessions);
    
    return newSession;
  }

  // Get all study sessions
  getSessions(): SpacedRepetitionSession[] {
    try {
      const sessionsJson = localStorage.getItem(this.SESSIONS_STORAGE_KEY);
      if (!sessionsJson) {
        return [];
      }
      
      const sessions = JSON.parse(sessionsJson) as SpacedRepetitionSession[];
      
      // Convert string dates back to Date objects
      return sessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));
    } catch (error) {
      console.error('Error retrieving spaced repetition sessions:', error);
      return [];
    }
  }

  // Save sessions to storage
  private saveSessions(sessions: SpacedRepetitionSession[]): void {
    try {
      localStorage.setItem(this.SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving spaced repetition sessions:', error);
      throw error;
    }
  }

  // Delete a session
  deleteSession(id: string): void {
    const sessions = this.getSessions();
    const updatedSessions = sessions.filter(s => s.id !== id);
    this.saveSessions(updatedSessions);
  }

  // Generate flashcards from material
  async generateFlashcardsFromMaterial(materialId: string, materialContent: string, count: number = 10): Promise<FlashCard[]> {
    try {
      const generatedFlashcards = await openRouterService.generateFlashcards(materialContent, count);
      
      // Convert to our flashcard format and save
      const newCards: FlashCard[] = [];
      
      for (const fc of generatedFlashcards) {
        const newCard = this.addFlashcard({
          question: fc.question,
          answer: fc.answer,
          materialId,
          difficultyLevel: 3 // Default medium difficulty
        });
        
        newCards.push(newCard);
      }
      
      return newCards;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
