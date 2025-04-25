
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { openRouterService } from '@/services/openRouterService';
import { storageService, StudySession } from '@/services/storageService';
import { StudyMaterial } from '@/services/fileProcessorService';
import { FileText, BookOpen, MessageCircle, Brain, Upload, Globe, Pencil, ChevronDown } from 'lucide-react';

const Index = () => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const hasApiKey = openRouterService.hasApiKey();
    setIsApiKeySet(hasApiKey);
    
    const savedSessions = storageService.getSessions();
    setSessions(savedSessions);
    
    if (savedSessions.length > 0) {
      setActiveSession(savedSessions[0]);
    }
    
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) {
      setShowWelcome(false);
    } else {
      setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('hasVisitedBefore', 'true');
      }, 5000);
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

  const renderWelcomeScreen = () => {
    if (!showWelcome) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50 animate-fade-in">
        <Card className="max-w-lg w-full p-6 shadow-lg animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to AI Study Hub
            </CardTitle>
            <CardDescription className="text-lg">
              Your intelligent study companion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 text-center">
                <Upload className="h-8 w-8 text-primary" />
                <p className="font-medium">Upload Materials</p>
                <p className="text-sm text-muted-foreground">PDF, documents, notes</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 text-center">
                <Brain className="h-8 w-8 text-primary" />
                <p className="font-medium">AI Analysis</p>
                <p className="text-sm text-muted-foreground">Smart learning insights</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 text-center">
                <MessageCircle className="h-8 w-8 text-primary" />
                <p className="font-medium">Interactive Chat</p>
                <p className="text-sm text-muted-foreground">Ask questions about content</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 text-center">
                <Pencil className="h-8 w-8 text-primary" />
                <p className="font-medium">Writing Tools</p>
                <p className="text-sm text-muted-foreground">Essays, grammar, exams</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowWelcome(false)}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = (tab: string) => {
    const contentClasses = "space-y-6 max-w-5xl mx-auto animate-fade-in";
    const headingClasses = "text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent";
    const descriptionClasses = "text-muted-foreground text-lg leading-relaxed";

    const writingToolsLink = (
      <div className="mb-4 flex justify-end">
        <Link to="/writing-tools">
          <Button variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <FileText className="h-4 w-4" />
            Writing Tools
          </Button>
        </Link>
      </div>
    );

    // Home Screen / Dashboard
    if (tab === 'upload' && sessions.length > 0) {
      return (
        <div className={contentClasses}>
          {writingToolsLink}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Welcome Card */}
            <Card className="col-span-1 md:col-span-2 animate-fade-in hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to AI Study Hub</CardTitle>
                <CardDescription>Your intelligent learning companion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Study Sessions</h3>
                    <p className="text-muted-foreground mb-4">You have {sessions.length} active study sessions with {sessions.reduce((total, session) => total + (session.materials?.length || 0), 0)} materials.</p>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="hover:scale-105 transition-transform duration-200"
                      onClick={() => setActiveTab('library')}
                    >
                      Browse Study Library →
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary/10 transition-colors duration-200"
                        onClick={() => setActiveTab('upload')}
                      >
                        <Upload className="h-4 w-4 mr-1" /> 
                        Upload
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary/10 transition-colors duration-200"
                        onClick={() => setActiveTab('chat')}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" /> 
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-primary/10 transition-colors duration-200"
                        onClick={() => setActiveTab('flashcards')}
                      >
                        <BookOpen className="h-4 w-4 mr-1" /> 
                        Flashcards
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Materials */}
            <Card className="col-span-1 animate-fade-in hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Recent Materials</CardTitle>
                <CardDescription>Your latest study content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.flatMap(session => session.materials || [])
                    .slice(0, 3)
                    .map((material, i) => (
                      <div 
                        key={i} 
                        className="p-3 rounded-lg border flex justify-between items-center hover:bg-accent/10 cursor-pointer transition-colors"
                        onClick={() => {
                          const session = sessions.find(s => s.materials?.some(m => m.id === material.id));
                          if (session) {
                            handleSessionSelect(session);
                            handleMaterialSelect(material);
                          }
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{material.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    ))}
                  {sessions.flatMap(session => session.materials || []).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                      <FileText className="h-10 w-10 mb-2 opacity-50" />
                      <p>No materials yet</p>
                      <p className="text-sm">Upload study materials to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Tools */}
            <Card className="col-span-1 animate-fade-in hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Study Tools</CardTitle>
                <CardDescription>Enhance your learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200"
                    onClick={() => setActiveTab('summarize')}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Summarize</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200"
                    onClick={() => setActiveTab('translate')}
                  >
                    <Globe className="h-5 w-5" />
                    <span>Translate</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200"
                    onClick={() => setActiveTab('notes')}
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Notes</span>
                  </Button>
                  <Link 
                    to="/writing-tools"
                    className="inline-block"
                  >
                    <Button 
                      variant="outline" 
                      className="h-20 w-full flex flex-col gap-1 hover-scale transition-all duration-200"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Writing Tools</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upload New Material Card */}
            <Card className="col-span-1 md:col-span-2 animate-fade-in hover:shadow-md transition-shadow duration-300 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Upload New Study Material</CardTitle>
                <CardDescription>Add PDF, text documents, or enter notes to start studying</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onFileProcessed={handleFileProcessed} />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center pt-8">
            <a href="#features" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors animate-pulse">
              <span>Explore More Features</span>
              <ChevronDown className="h-6 w-6" />
            </a>
          </div>

          <div id="features" className="pt-16 pb-8">
            <h2 className={`${headingClasses} text-center`}>
              Powerful Study Features
            </h2>
            <p className={`${descriptionClasses} text-center max-w-2xl mx-auto mb-8`}>
              Advanced tools powered by AI to enhance your learning experience
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: <Brain className="h-10 w-10 mb-4 text-primary" />,
                  title: "AI Assistance",
                  description: "Get instant answers about your study materials through intelligent conversation",
                  action: () => setActiveTab('chat')
                },
                {
                  icon: <BookOpen className="h-10 w-10 mb-4 text-primary" />,
                  title: "Smart Flashcards",
                  description: "Automatically generate interactive flashcards from your uploaded content",
                  action: () => setActiveTab('flashcards')
                },
                {
                  icon: <Brain className="h-10 w-10 mb-4 text-primary" />,
                  title: "Spaced Repetition",
                  description: "Enhance long-term memory with scientifically proven learning methods",
                  action: () => setActiveTab('spaced-rep')
                }
              ].map((feature, i) => (
                <Card key={i} className="animate-fade-in hover-scale transition-all duration-300 cursor-pointer" onClick={feature.action}>
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium mt-2">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    switch (tab) {
      case 'upload':
        return (
          <div className={contentClasses}>
            {writingToolsLink}
            <div className="max-w-2xl space-y-2">
              <h1 className={headingClasses}>Upload Study Material</h1>
              <p className={descriptionClasses}>
                Transform your study materials into interactive learning experiences with AI assistance.
              </p>
            </div>
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
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
            <div className="mt-8 animate-fade-in">
              <TextToSpeech initialText={activeMaterial?.content ? activeMaterial.content.substring(0, 1000) : ""} />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center animate-fade-in">
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
    <>
      {renderWelcomeScreen()}
      <MainLayout
        activeSession={activeSession}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderContent(activeTab)}
      </MainLayout>
    </>
  );
};

export default Index;
