
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  FileText,
  Upload,
  Search,
  Image,
  Pencil,
  ArrowUp,
  ArrowDown,
  BookOpen,
  MessageCircle,
  Menu,
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

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AI Study Hub
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {activeSession && (
              <Badge variant="secondary" className="px-4 py-1 text-sm">
                {activeSession.name}
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex min-h-[calc(100vh-4rem)] gap-6 py-6">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 shrink-0 border-r glass-panel transition-all duration-300 lg:sticky ${
          isSidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0'
        }`}>
          <ScrollArea className="h-full py-6 pl-8 pr-6">
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
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Upload Material</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="browser" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Search className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Browse Webpage</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="ocr" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Image className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>OCR Image</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="notes" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Notes</span>
                </TabsTrigger>

                <Separator className="my-4" />
                
                <TabsTrigger 
                  value="library" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Book className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Study Library</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="chat" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>AI Chat</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="flashcards" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Flashcards</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="summarize" 
                  className="w-full justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Summarize</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </ScrollArea>
        </aside>

        {/* Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-0'}`}>
          <div className="h-full rounded-xl glass-panel p-6 animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
