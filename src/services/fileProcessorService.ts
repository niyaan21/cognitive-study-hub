
import { v4 as uuidv4 } from 'uuid';
import * as pdfjs from 'pdfjs-dist';
import { openRouterService } from './openRouterService';

// Set worker path for pdf.js
const pdfjsWorker = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Types for study materials
export interface StudyMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'docx' | 'pptx' | 'image' | 'audio' | 'url' | 'note';
  content: string;
  chunks: TextChunk[];
  dateAdded: Date;
  summary?: string;
  embedding?: number[];
}

export interface TextChunk {
  id: string;
  text: string;
  embedding?: number[];
}

// Service for processing various file types
export class FileProcessorService {
  async processFile(file: File): Promise<StudyMaterial> {
    try {
      const fileType = this.getFileType(file);
      const id = uuidv4();
      let content = '';

      // Process based on file type
      switch (fileType) {
        case 'pdf':
          content = await this.extractTextFromPDF(file);
          break;
        case 'text':
          content = await this.readTextFile(file);
          break;
        case 'docx':
        case 'pptx':
        case 'audio':
          // For these formats, we'll use AI to extract text
          // First, convert to base64
          const base64 = await this.fileToBase64(file);
          content = `This is a ${fileType} file. Please use the AI Assistant to extract content.`;
          break;
        case 'image':
          // For images, we'll use OCR via OpenRouter
          const imageBase64 = await this.fileToBase64(file);
          content = await this.extractTextFromImage(imageBase64);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Create chunks (simple split by paragraphs for now)
      const chunks = this.createTextChunks(content);

      return {
        id,
        name: file.name,
        type: fileType,
        content,
        chunks,
        dateAdded: new Date(),
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  async processUrl(url: string): Promise<StudyMaterial> {
    try {
      const id = uuidv4();
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('Failed to fetch URL content');
      }

      // Extract text from HTML content
      const tempElement = document.createElement('div');
      tempElement.innerHTML = data.contents;
      
      // Extract text and clean it up
      const content = Array.from(tempElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'))
        .map(el => el.textContent)
        .filter(text => text && text.trim().length > 0)
        .join('\n\n');

      // Create chunks
      const chunks = this.createTextChunks(content);

      return {
        id,
        name: url,
        type: 'url',
        content,
        chunks,
        dateAdded: new Date(),
      };
    } catch (error) {
      console.error('Error processing URL:', error);
      throw error;
    }
  }

  async createNote(title: string, content: string): Promise<StudyMaterial> {
    const id = uuidv4();
    const chunks = this.createTextChunks(content);

    return {
      id,
      name: title,
      type: 'note',
      content,
      chunks,
      dateAdded: new Date(),
    };
  }

  private getFileType(file: File): StudyMaterial['type'] {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension) {
      throw new Error('Could not determine file type');
    }

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'txt':
      case 'md':
        return 'text';
      case 'docx':
      case 'doc':
        return 'docx';
      case 'pptx':
      case 'ppt':
        return 'pptx';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'm4a':
        return 'audio';
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async extractTextFromImage(imageBase64: string): Promise<string> {
    // We'll use OpenRouter's vision model to extract text
    return openRouterService.extractTextFromImage(imageBase64);
  }

  private createTextChunks(text: string, maxLength: number = 500): TextChunk[] {
    // Simple chunking by paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: TextChunk[] = [];
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= maxLength) {
        currentChunk += paragraph + '\n\n';
      } else {
        if (currentChunk) {
          chunks.push({
            id: uuidv4(),
            text: currentChunk.trim()
          });
        }
        currentChunk = paragraph + '\n\n';
      }
    }
    
    if (currentChunk) {
      chunks.push({
        id: uuidv4(),
        text: currentChunk.trim()
      });
    }
    
    return chunks;
  }
}

export const fileProcessorService = new FileProcessorService();
