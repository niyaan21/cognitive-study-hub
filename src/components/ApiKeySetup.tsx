
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { openRouterService } from '@/services/openRouterService';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save the API key
      openRouterService.setApiKey(apiKey.trim());
      
      // Test the API key with a simple request
      await openRouterService.chat([{ role: 'user', content: 'Hello' }]);
      
      onApiKeySet();
    } catch (err) {
      setError('Invalid API key or API request failed. Please check your key and try again.');
      console.error('API key validation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Up Your OpenRouter API Key</CardTitle>
          <CardDescription>
            Your AI Study App requires an OpenRouter API key to provide AI features.
            You can get a free API key from <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              openrouter.ai
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="w-full"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="text-sm text-gray-500">
              <p>Your API key is stored locally in your browser and is never sent to our servers.</p>
              <p className="mt-2">This app uses OpenRouter's free models to power the AI features.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveApiKey} 
            disabled={isLoading || !apiKey.trim()} 
            className="w-full"
          >
            {isLoading ? 'Validating...' : 'Save API Key'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeySetup;
