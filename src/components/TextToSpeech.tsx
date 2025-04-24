
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, Volume2 } from "lucide-react";
import { textToSpeechService } from '@/services/textToSpeechService';

const TextToSpeech: React.FC<{ initialText?: string }> = ({ initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = textToSpeechService.getVoices();
      setVoices(availableVoices);
      
      // Select default voice if available
      if (availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(voice => voice.default);
        setSelectedVoice(defaultVoice?.voiceURI || availableVoices[0].voiceURI);
      }
    };
    
    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Clean up on unmount
    return () => {
      if (speaking) {
        textToSpeechService.stop();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;
    
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    
    textToSpeechService.speak(text, {
      voice,
      rate,
      pitch, 
      volume,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  const handleStop = () => {
    textToSpeechService.stop();
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to be spoken..."
        className="min-h-[150px]"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select 
                value={selectedVoice} 
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(voice => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Rate: {rate.toFixed(1)}</label>
              </div>
              <Slider 
                value={[rate]} 
                min={0.5} 
                max={2} 
                step={0.1}
                onValueChange={(values) => setRate(values[0])} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Pitch: {pitch.toFixed(1)}</label>
              </div>
              <Slider 
                value={[pitch]} 
                min={0.5} 
                max={2} 
                step={0.1}
                onValueChange={(values) => setPitch(values[0])} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Volume: {volume.toFixed(1)}</label>
              </div>
              <Slider 
                value={[volume]} 
                min={0} 
                max={1} 
                step={0.1}
                onValueChange={(values) => setVolume(values[0])} 
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="flex justify-center items-center gap-4">
            {speaking ? (
              <Button 
                variant="destructive" 
                size="lg" 
                className="w-full" 
                onClick={handleStop}
              >
                <Square className="mr-2 h-5 w-5" />
                Stop Speaking
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="lg" 
                className="w-full"
                onClick={handleSpeak}
                disabled={!text.trim()}
              >
                <Play className="mr-2 h-5 w-5" />
                Speak Text
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Volume2 className="inline mr-1 h-4 w-4" />
            Make sure your volume is turned up
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
