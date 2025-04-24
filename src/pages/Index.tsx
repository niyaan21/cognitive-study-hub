
import React, { useState, useEffect } from 'react';
import ApiKeySetup from '@/components/ApiKeySetup';
import MainLayout from '@/components/MainLayout';
import FileUploader from '@/components/FileUploader';
import StudyLibrary from '@/components/StudyLibrary';
import AiChat from '@/components/AiChat';
import WebpageBrowser from '@/components/WebpageBrowser';
import NoteTaking from '@/components/NoteTaking';
import Flashcards from '@/components/Flashcards';
import SpacedRepetition from '@/components/SpacedRepetition';
import Translation from '@/components/Translation';
import ImageOcr from '@/components/ImageOcr';
import Summarize from '@/components/Summarize';
import TextToSpeech from '@/components/TextToSpeech';
import { openRouterService } from '@/services/openRouterService';
import { storageService, StudySession } from '@/services/storageService';
import { StudyMaterial } from '@/services/fileProcessorService';

const Index = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);

  useEffect(() => {
    const hasApiKey = openRouterService.hasApiKey();
    setIsApiKeySet(hasApiKey);
    
    const savedSessions = storageService.getSessions();
    setSessions(savedSessions);
    
    if (savedSessions.length > 0) {
      setActiveSession(savedSessions[0]);
    }
  }, []);

  const handleApiKeySet = () => {
    setIsApiKeySet(true);
  };

  const handleFileProcessed = (material: StudyMaterial) => {
    if (!activeSession) {
      const newSession = storageService.createSession(`Study Session ${sessions.length + 1}`);
      setActiveSession(newSession);
      storageService.addMaterialToSession(newSession.id, material);
      
      setSessions(storageService.getSessions());
    } else {
      storageService.addMaterialToSession(activeSession.id, material);
      
      setSessions(storageService.getSessions());
      
      setActiveSession(storageService.getSession(activeSession.id) || null);
    }
    
    if (material.type === 'note' || material.type === 'url') {
      setActiveTab('summarize');
    } else {
      setActiveMaterial(material);
      setActiveTab('library');
    }
  };

  const handleSessionCreate = (name: string) => {
    const newSession = storageService.createSession(name);
    setSessions(storageService.getSessions());
    setActiveSession(newSession);
  };

  const handleSessionSelect = (session: StudySession) => {
    setActiveSession(session);
    setActiveMaterial(null);
  };

  const handleSessionDelete = (id: string) => {
    storageService.deleteSession(id);
    setSessions(storageService.getSessions());
    
    if (activeSession?.id === id) {
      const remainingSessions = storageService.getSessions();
      setActiveSession(remainingSessions.length > 0 ? remainingSessions[0] : null);
    }
  };

  const handleMaterialSelect = (material: StudyMaterial) => {
    setActiveMaterial(material);
    setActiveTab('chat');
  };

  const handleMaterialDelete = (sessionId: string, materialId: string) => {
    storageService.removeMaterialFromSession(sessionId, materialId);
    
    setSessions(storageService.getSessions());
    
    setActiveSession(storageService.getSession(sessionId) || null);
    
    if (activeMaterial?.id === materialId) {
      setActiveMaterial(null);
    }
  };

  const renderContent = (tab: string) => {
    const contentClasses = "space-y-6 max-w-5xl mx-auto animate-fade-in";
    const headingClasses = "text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent";
    const descriptionClasses = "text-muted-foreground text-lg leading-relaxed";

    switch (tab) {
      case 'upload':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Upload Study Material</h1>
              <p className={descriptionClasses}>
                Transform your study materials into interactive learning experiences with AI assistance.
              </p>
            </div>
            <div className="mt-8">
              <FileUploader onFileProcessed={handleFileProcessed} />
            </div>
          </div>
        );

      case 'browser':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Browse Webpage</h1>
              <p className={descriptionClasses}>
                Extract and analyze study content from any webpage instantly.
              </p>
            </div>
            <div className="mt-8">
              <WebpageBrowser onContentProcessed={handleFileProcessed} />
            </div>
          </div>
        );

      case 'ocr':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>OCR Image</h1>
              <p className={descriptionClasses}>
                Convert images of text into editable study materials effortlessly.
              </p>
            </div>
            <div className="mt-8">
              <ImageOcr onContentProcessed={handleFileProcessed} />
            </div>
          </div>
        );

      case 'library':
        return (
          <div className={contentClasses}>
            <StudyLibrary
              sessions={sessions}
              activeSession={activeSession}
              onSessionSelect={handleSessionSelect}
              onSessionCreate={handleSessionCreate}
              onSessionDelete={handleSessionDelete}
              onMaterialSelect={handleMaterialSelect}
              onMaterialDelete={handleMaterialDelete}
            />
          </div>
        );

      case 'notes':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Study Notes</h1>
              <p className={descriptionClasses}>
                Create and organize comprehensive study notes with AI assistance.
              </p>
            </div>
            <div className="mt-8">
              <NoteTaking onNoteSaved={handleFileProcessed} autoGenerateFrom={activeMaterial} />
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>AI Chat Assistant</h1>
              <p className={descriptionClasses}>
                {activeMaterial 
                  ? `Discuss "${activeMaterial.name}" with your AI study companion.`
                  : "Select study material to start an intelligent conversation."}
              </p>
            </div>
            <div className="mt-8">
              <AiChat activeMaterial={activeMaterial} />
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Study Flashcards</h1>
              <p className={descriptionClasses}>
                Practice and reinforce your knowledge with AI-generated flashcards.
              </p>
            </div>
            <div className="mt-8">
              <Flashcards material={activeMaterial} />
            </div>
          </div>
        );

      case 'spaced-rep':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Smart Spaced Repetition</h1>
              <p className={descriptionClasses}>
                Review material at scientifically optimized intervals to maximize long-term retention.
              </p>
            </div>
            <div className="mt-8">
              <SpacedRepetition material={activeMaterial} />
            </div>
          </div>
        );

      case 'summarize':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Summarize</h1>
              <p className={descriptionClasses}>
                Generate concise, AI-powered summaries of your study materials.
              </p>
            </div>
            <div className="mt-8">
              <Summarize material={activeMaterial} />
            </div>
          </div>
        );

      case 'translate':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Translate Content</h1>
              <p className={descriptionClasses}>
                Translate study materials into different languages with AI assistance.
              </p>
            </div>
            <div className="mt-8">
              <Translation />
            </div>
          </div>
        );

      case 'text-to-speech':
        return (
          <div className={contentClasses}>
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Text to Speech</h1>
              <p className={descriptionClasses}>
                Convert your study materials to audio for auditory learning.
              </p>
            </div>
            <div className="mt-8">
              <TextToSpeech initialText={activeMaterial?.content ? activeMaterial.content.substring(0, 1000) : ""} />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              Coming Soon!
            </h2>
            <p className="text-muted-foreground max-w-md">
              This feature is under development. Try uploading study materials
              and chatting with the AI assistant!
            </p>
          </div>
        );
    }
  };

  if (!isApiKeySet) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return (
    <MainLayout
      activeSession={activeSession}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent(activeTab)}
    </MainLayout>
  );
};

export default Index;
