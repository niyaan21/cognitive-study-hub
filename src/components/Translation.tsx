
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { openRouterService } from '@/services/openRouterService';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese',
  'Arabic', 'Hindi', 'Dutch', 'Polish', 'Turkish'
];

const Translation: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const result = await openRouterService.translateText(inputText, targetLanguage);
      setTranslation(result);
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Enter text to translate..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[100px]"
        />
        
        <div className="flex gap-4">
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleTranslate} 
            disabled={isTranslating || !inputText.trim()}
            className="flex-1"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </div>
      </div>

      {translation && (
        <Card>
          <CardContent className="p-4">
            <div className="prose dark:prose-invert max-w-none">
              {translation}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Translation;
