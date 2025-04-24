import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BookOpen,
  MessageCircle,
  Menu,
  Upload,
  Search,
  Image,
  Pencil,
  ArrowUp,
  ArrowDown,
  Book,
  X,
  Brain,
  Globe,
  Volume2,
  Edit3
} from "lucide-react";
import { StudySession } from '@/services/storageService';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/sonner";
import Tutorial from './Tutorial';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  activeSession: StudySession | null;
  children: React.ReactNode;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  activeSession,
  children,
  onTabChange,
  activeTab,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('hasShownWelcomeToast');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast.success("Welcome to AI Study Hub", {
          description: "Your personalized study assistant is ready to help!",
          duration: 5000,
        });
        localStorage.setItem('hasShownWelcomeToast', 'true');
      }, 1000);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTutorialClick = () => {
    setIsTutorialOpen(true);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 animate-in">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? 
                <Menu className="h-5 w-5 transition-transform duration-200 ease-in-out" /> :
                <X className="h-5 w-5 transition-transform duration-200 ease-in-out" />
              }
            </Button>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hidden sm:inline-block">
                AI Study Hub
              </span>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent sm:hidden">
                Hub
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {activeSession && (
              <Badge variant="outline" className="hidden md:flex border-primary/20 bg-primary/5">
                {activeSession.name}
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)] relative">
        <aside 
          className={`fixed inset-y-16 left-0 z-30 w-72 transform transition-all duration-300 ease-in-out lg:relative lg:inset-y-0 ${
            isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          } lg:translate-x-0 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm`}
        >
          <ScrollArea className="h-full py-6 pl-4 pr-2">
            <div className="mb-4 px-3">
              <div className="text-foreground/80 font-medium text-sm mb-1">Your Study Assistant</div>
              <p className="text-xs text-muted-foreground">Access all tools and materials</p>
            </div>
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              className="w-full"
              orientation="vertical"
              onValueChange={(value) => {
                onTabChange(value);
                if (isMobile) {
                  setIsSidebarCollapsed(true);
                }
              }}
            >
              <TabsList className="flex h-auto flex-col items-start gap-1 bg-transparent">
                <div className="w-full px-3 py-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">CONTENT</p>
                </div>
                <TabsTrigger 
                  value="upload" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Material</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="browser" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Webpage</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="ocr" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Image className="h-4 w-4" />
                  <span>OCR Image</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="notes" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Notes</span>
                </TabsTrigger>

                <Separator className="my-4" />
                
                <div className="w-full px-3 py-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">STUDY TOOLS</p>
                </div>
                
                <TabsTrigger 
                  value="library" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Book className="h-4 w-4" />
                  <span>Study Library</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="chat" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="flashcards" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Flashcards</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="spaced-rep" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Brain className="h-4 w-4" />
                  <span>Spaced Repetition</span>
                  <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">New</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="summarize" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>Summarize</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="translate" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Translate</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="text-to-speech" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Text to Speech</span>
                  <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">New</span>
                </TabsTrigger>

                <Separator className="my-4" />
                
                <div className="w-full px-3 py-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">WRITING TOOLS</p>
                </div>

                <Link 
                  to="/writing-tools" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors flex items-center"
                  onClick={() => {
                    if (isMobile) {
                      setIsSidebarCollapsed(true);
                    }
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Writing Assistant</span>
                  <span className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">New</span>
                </Link>
              </TabsList>
            </Tabs>
            
            <div className="mt-6 px-3">
              <div className="rounded-lg border bg-card p-4 shadow-sm hover:border-primary/20 transition-colors cursor-pointer" onClick={handleTutorialClick}>
                <h4 className="text-sm font-semibold mb-1">Need Help?</h4>
                <p className="text-xs text-muted-foreground mb-3">Get assistance with study tools</p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Tutorial
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 overflow-hidden">
          <div className="container h-full px-4 py-6 lg:px-8 transition-all duration-300">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6 animate-in fade-in">
              {children}
            </div>
          </div>
        </main>

        {!isSidebarCollapsed && isMobile && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>
      
      <Tutorial open={isTutorialOpen} onOpenChange={setIsTutorialOpen} />
    </div>
  );
};

export default MainLayout;
