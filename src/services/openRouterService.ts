import axios from 'axios';

// OpenRouter API service for accessing AI models
export class OpenRouterService {
  private static API_URL = 'https://openrouter.ai/api/v1';
  private apiKey: string | null = null;

  constructor() {
    // Check if API key exists in local storage
    this.apiKey = localStorage.getItem('openrouter_api_key');
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('openrouter_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async chat(messages: Array<{ role: string; content: string }>, model: string = 'openai/gpt-3.5-turbo'): Promise<string> {
    if (!this.hasApiKey()) {
      throw new Error('API key not set');
    }

    try {
      const response = await axios.post(
        `${OpenRouterService.API_URL}/chat/completions`,
        {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.href,
          },
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response from OpenRouter API');
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  async generateEmbeddings(text: string, model: string = 'openai/text-embedding-ada-002'): Promise<number[]> {
    if (!this.hasApiKey()) {
      throw new Error('API key not set');
    }

    try {
      const response = await axios.post(
        `${OpenRouterService.API_URL}/embeddings`,
        {
          model,
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.href,
          },
        }
      );

      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0].embedding;
      } else {
        throw new Error('Invalid embedding response from OpenRouter API');
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async summarize(text: string): Promise<string> {
    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert academic summarizer. Create a professional, well-structured summary with clear sections, key points, and main takeaways. Format with headings and bullet points where needed.' 
      },
      { 
        role: 'user', 
        content: `Create a comprehensive, professional summary of the following material:\n\n${text}` 
      }
    ];
    return this.chat(messages);
  }

  async generateFlashcards(text: string, count: number = 8): Promise<Array<{question: string; answer: string}>> {
    const messages = [
      { 
        role: 'system', 
        content: `You are an expert study assistant. Create ${count} high-quality flashcards with question-answer pairs from the following text. Make questions challenging but clear. Focus on key concepts and ensure answers are detailed but concise. Return ONLY valid JSON in the format [{\"question\": \"...\", \"answer\": \"...\"}]` 
      },
      { role: 'user', content: text }
    ];
    
    const result = await this.chat(messages);
    try {
      // Extract JSON from the response (in case model adds text around the JSON)
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(result);
      }
    } catch (error) {
      console.error('Failed to parse flashcards JSON:', error);
      throw new Error('Failed to generate valid flashcards');
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const messages = [
      { role: 'system', content: `You are a translation expert. Translate the following text to ${targetLanguage}.` },
      { role: 'user', content: text }
    ];
    return this.chat(messages);
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert study assistant. Answer the question based on the provided context. If the answer is not in the context, say "I don\'t have enough information to answer this question." Provide detailed, well-structured answers with examples where possible.' 
      },
      { 
        role: 'user', 
        content: `Context: ${context}\n\nQuestion: ${question}` 
      }
    ];
    return this.chat(messages);
  }

  async extractTextFromImage(imageBase64: string): Promise<string> {
    const messages = [
      { role: 'system', content: 'Extract all visible text from this image.' },
      { role: 'user', content: [
        { type: 'image_url', image_url: { url: imageBase64 } }
      ] }
    ];
    
    if (!this.hasApiKey()) {
      throw new Error('API key not set');
    }

    try {
      const response = await axios.post(
        `${OpenRouterService.API_URL}/chat/completions`,
        {
          model: 'anthropic/claude-3-opus-20240229', // Vision-capable model
          messages,
          temperature: 0.3,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.href,
          },
        }
      );

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response from OpenRouter API');
      }
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw error;
    }
  }

  async generateStructuredNotes(text: string): Promise<string> {
    const messages = [
      { 
        role: 'system', 
        content: 'You are an expert academic note-taker with skills in organizing complex information into clear, structured study materials. Create comprehensive notes suitable for university-level students.' 
      },
      { 
        role: 'user', 
        content: `Create comprehensive, well-structured study notes from the following content. 
        Format with clear headers, subheaders, bullet points, and numbered lists where appropriate. 
        Highlight key concepts, definitions, and important takeaways. 
        Organize the information logically and include a brief summary at the beginning. 
        Make it extremely professional and ready for academic use:\n\n${text}` 
      }
    ];
    return this.chat(messages);
  }
}

export const openRouterService = new OpenRouterService();
