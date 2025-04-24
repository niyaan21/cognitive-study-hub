
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Book, Loader2 } from "lucide-react";
import { openRouterService } from '@/services/openRouterService';
import { StudyMaterial } from '@/services/fileProcessorService';
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

interface AiChatProps {
  activeMaterial: StudyMaterial | null;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  usedContext?: boolean;
}

const AiChat: React.FC<AiChatProps> = ({ activeMaterial }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Update welcome message when active material changes
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: activeMaterial
        ? `Hello! I'm your AI study assistant. I can help you understand "${activeMaterial.name}". What would you like to know about it?`
        : "Hello! I'm your AI study assistant. Upload a study material or select one from your library to get started!",
      timestamp: new Date(),
      usedContext: false,
    };
    
    setMessages([welcomeMessage]);
  }, [activeMaterial]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: string;
      let usedContext = false;
      
      if (activeMaterial) {
        // If there's active material, use it as context for the AI
        response = await openRouterService.answerQuestion(input, activeMaterial.content);
        usedContext = true;
        toast.success("Response generated using your study material");
      } else {
        // Otherwise just have a general conversation
        const chatHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        response = await openRouterService.chat([
          ...chatHistory,
          { role: 'user', content: input }
        ]);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant' as const,
        timestamp: new Date(),
        usedContext,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response from AI:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: 'assistant' as const,
        timestamp: new Date(),
        usedContext: false,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {activeMaterial && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Book className="h-3 w-3" />
            Studying: {activeMaterial.name}
          </Badge>
        </div>
      )}
      
      <div className="flex-1 mb-4 relative">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`${
                  message.role === 'assistant'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <CardContent className="p-4">
                  {message.role === 'assistant' ? (
                    <>
                      <ReactMarkdown className="prose dark:prose-invert max-w-none">
                        {message.content}
                      </ReactMarkdown>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.usedContext && (
                          <Badge variant="outline" className="ml-2">
                            Based on study material
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>{message.content}</p>
                      <div className="text-xs opacity-70 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="relative">
        <Textarea
          placeholder={
            activeMaterial
              ? `Ask a question about "${activeMaterial.name}"...`
              : "Ask a question or select study material..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="min-h-[80px] pr-12"
          disabled={isLoading}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          <ArrowUp size={18} />
        </Button>
      </div>
    </div>
  );
};

export default AiChat;
