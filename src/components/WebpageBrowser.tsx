
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe } from "lucide-react";
import { fileProcessorService } from '@/services/fileProcessorService';

interface WebpageBrowserProps {
  onContentProcessed: (processedContent: any) => void;
}

const WebpageBrowser: React.FC<WebpageBrowserProps> = ({ onContentProcessed }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setExtractedContent(null);

    try {
      const processedContent = await fileProcessorService.processUrl(url);
      setExtractedContent(processedContent.content);
      onContentProcessed(processedContent);
    } catch (err: any) {
      console.error('Error extracting content:', err);
      setError('Failed to extract content from the webpage. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleExtract} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter webpage URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={isLoading}>
            <Globe className="mr-2 h-4 w-4" />
            {isLoading ? 'Extracting...' : 'Extract Content'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {extractedContent && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <ScrollArea className="h-[400px]">
                <div className="prose dark:prose-invert max-w-none">
                  {extractedContent}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default WebpageBrowser;
