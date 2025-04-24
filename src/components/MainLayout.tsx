
import React from 'react';
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
} from "lucide-react";
import { StudySession } from '@/services/storageService';
import { ThemeToggle } from './ThemeToggle';

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
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex lg:hidden items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
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
          <div className="flex items-center gap-2 md:gap-4">
            {activeSession && (
              <Badge variant="secondary" className="hidden md:flex">
                {activeSession.name}
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] relative">
        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-14 left-0 z-30 w-64 transform transition-transform duration-300 lg:relative lg:inset-y-0 ${
            isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          } lg:translate-x-0 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
        >
          <ScrollArea className="h-full py-6 pl-4 pr-2">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              className="w-full"
              orientation="vertical"
              onValueChange={onTabChange}
            >
              <TabsList className="flex h-auto flex-col items-start gap-1 bg-transparent">
                <TabsTrigger 
                  value="upload" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Material</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="browser" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Webpage</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="ocr" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Image className="h-4 w-4" />
                  <span>OCR Image</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="notes" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Notes</span>
                </TabsTrigger>

                <Separator className="my-4" />
                
                <TabsTrigger 
                  value="library" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Book className="h-4 w-4" />
                  <span>Study Library</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="chat" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="flashcards" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Flashcards</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="summarize" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>Summarize</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </ScrollArea>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="container h-full px-4 py-6 lg:px-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6 animate-in fade-in-50">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Overlay */}
        {!isSidebarCollapsed && isMobile && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
        )}
      </div>
    </div>
  );
};

export default MainLayout;
