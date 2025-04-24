
import { v4 as uuidv4 } from 'uuid';
import { StudyMaterial, TextChunk } from './fileProcessorService';
import { openRouterService } from './openRouterService';

// Interface for a study session
export interface StudySession {
  id: string;
  name: string;
  materials: StudyMaterial[];
  dateCreated: Date;
  dateModified: Date;
}

// Storage service for managing study materials and sessions
export class StorageService {
  private readonly SESSION_STORAGE_KEY = 'ai_study_sessions';
  
  // Create a new study session
  createSession(name: string): StudySession {
    const session: StudySession = {
      id: uuidv4(),
      name,
      materials: [],
      dateCreated: new Date(),
      dateModified: new Date()
    };

    this.saveSession(session);
    return session;
  }

  // Get all saved study sessions
  getSessions(): StudySession[] {
    try {
      const sessionsJson = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!sessionsJson) {
        return [];
      }
      
      const sessions = JSON.parse(sessionsJson) as StudySession[];
      
      // Convert string dates back to Date objects
      return sessions.map(session => ({
        ...session,
        dateCreated: new Date(session.dateCreated),
        dateModified: new Date(session.dateModified),
        materials: session.materials.map(material => ({
          ...material,
          dateAdded: new Date(material.dateAdded)
        }))
      }));
    } catch (error) {
      console.error('Error retrieving sessions:', error);
      return [];
    }
  }

  // Get a specific session by ID
  getSession(id: string): StudySession | undefined {
    return this.getSessions().find(session => session.id === id);
  }

  // Save or update a session
  saveSession(session: StudySession): void {
    try {
      // Update the modified date
      session.dateModified = new Date();
      
      // Get existing sessions and add or update this one
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Save to localStorage
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  // Delete a session
  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter(session => session.id !== id);
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Add a study material to a session
  addMaterialToSession(sessionId: string, material: StudyMaterial): StudySession {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    session.materials.push(material);
    session.dateModified = new Date();
    this.saveSession(session);
    
    return session;
  }

  // Remove a material from a session
  removeMaterialFromSession(sessionId: string, materialId: string): StudySession {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    session.materials = session.materials.filter(m => m.id !== materialId);
    session.dateModified = new Date();
    this.saveSession(session);
    
    return session;
  }

  // Generate and save embeddings for a material
  async generateAndSaveEmbeddings(sessionId: string, materialId: string): Promise<StudyMaterial> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const materialIndex = session.materials.findIndex(m => m.id === materialId);
    if (materialIndex < 0) {
      throw new Error(`Material with ID ${materialId} not found in session ${sessionId}`);
    }

    const material = session.materials[materialIndex];
    
    try {
      // Generate embeddings for each chunk
      for (let i = 0; i < material.chunks.length; i++) {
        const chunk = material.chunks[i];
        if (!chunk.embedding) {
          chunk.embedding = await openRouterService.generateEmbeddings(chunk.text);
        }
      }

      // Update the material in the session
      session.materials[materialIndex] = material;
      this.saveSession(session);
      
      return material;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  // Generate and save summary
  async generateAndSaveSummary(sessionId: string, materialId: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const materialIndex = session.materials.findIndex(m => m.id === materialId);
    if (materialIndex < 0) {
      throw new Error(`Material with ID ${materialId} not found in session ${sessionId}`);
    }

    try {
      const material = session.materials[materialIndex];
      const summary = await openRouterService.summarize(material.content);
      
      // Update the material with the summary
      material.summary = summary;
      session.materials[materialIndex] = material;
      this.saveSession(session);
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  // Semantic search across all materials in a session
  async semanticSearch(sessionId: string, query: string): Promise<Array<{material: StudyMaterial; chunk: TextChunk; similarity: number}>> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await openRouterService.generateEmbeddings(query);
      const results = [];

      // Search through all materials and their chunks
      for (const material of session.materials) {
        for (const chunk of material.chunks) {
          if (chunk.embedding) {
            // Calculate cosine similarity
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
            results.push({
              material,
              chunk,
              similarity
            });
          }
        }
      }

      // Sort by similarity (highest first) and return top results
      return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    } catch (error) {
      console.error('Error during semantic search:', error);
      throw error;
    }
  }

  // Helper function to calculate cosine similarity between two embeddings
  private cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  // Export a study session (for downloading)
  exportSession(sessionId: string): string {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    return JSON.stringify(session);
  }

  // Import a study session (from uploaded file)
  importSession(sessionData: string): StudySession {
    try {
      const importedSession = JSON.parse(sessionData) as StudySession;
      
      // Ensure the imported session has all required fields
      if (!importedSession.id || !importedSession.name || !Array.isArray(importedSession.materials)) {
        throw new Error('Invalid session data format');
      }

      // Generate a new ID to avoid conflicts with existing sessions
      importedSession.id = uuidv4();
      
      // Update dates
      importedSession.dateCreated = new Date();
      importedSession.dateModified = new Date();

      this.saveSession(importedSession);
      return importedSession;
    } catch (error) {
      console.error('Error importing session:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
