
// Text-to-Speech service using the Web Speech API
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private defaultVoice: SpeechSynthesisVoice | null = null;
  private defaultRate: number = 1.0;
  private defaultPitch: number = 1.0;
  private defaultVolume: number = 1.0;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Handle dynamic voice loading which happens in some browsers
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
    }
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    // Try to set a default English voice
    this.defaultVoice = this.voices.find(voice => 
      voice.lang.includes('en') && voice.localService
    ) || this.voices[0] || null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, options?: {
    voice?: SpeechSynthesisVoice,
    rate?: number,
    pitch?: number,
    volume?: number,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (event: SpeechSynthesisErrorEvent) => void
  }): void {
    // Cancel any ongoing speech
    this.stop();
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set properties
    utterance.voice = options?.voice || this.defaultVoice;
    utterance.rate = options?.rate || this.defaultRate;
    utterance.pitch = options?.pitch || this.defaultPitch;
    utterance.volume = options?.volume || this.defaultVolume;
    
    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options?.onStart) options.onStart();
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };
    
    utterance.onerror = (event) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.error('Speech synthesis error:', event);
      if (options?.onError) options.onError(event);
    };
    
    // Store the utterance so it doesn't get garbage collected
    this.currentUtterance = utterance;
    
    // Start speaking
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  setDefaultVoice(voice: SpeechSynthesisVoice): void {
    this.defaultVoice = voice;
  }

  setDefaultRate(rate: number): void {
    this.defaultRate = rate;
  }

  setDefaultPitch(pitch: number): void {
    this.defaultPitch = pitch;
  }

  setDefaultVolume(volume: number): void {
    this.defaultVolume = volume;
  }
}

export const textToSpeechService = new TextToSpeechService();
