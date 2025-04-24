
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Book, FileText, Image, Trash, Download } from "lucide-react";
import { StudySession, storageService } from '@/services/storageService';
import { StudyMaterial } from '@/services/fileProcessorService';

interface StudyLibraryProps {
  sessions: StudySession[];
  activeSession: StudySession | null;
  onSessionSelect: (session: StudySession) => void;
  onSessionCreate: (name: string) => void;
  onSessionDelete: (id: string) => void;
  onMaterialSelect: (material: StudyMaterial) => void;
  onMaterialDelete: (sessionId: string, materialId: string) => void;
}

const StudyLibrary: React.FC<StudyLibraryProps> = ({
  sessions,
  activeSession,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onMaterialSelect,
  onMaterialDelete,
}) => {
  const [newSessionName, setNewSessionName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      onSessionCreate(newSessionName.trim());
      setNewSessionName('');
      setDialogOpen(false);
    }
  };

  const handleExportSession = (session: StudySession) => {
    try {
      const sessionData = storageService.exportSession(session.id);
      const blob = new Blob([sessionData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.name.replace(/\s+/g, '_')}_study_session.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Error exporting session:', error);
      // Add notification/toast here
    }
  };

  const getMaterialIcon = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'text':
      case 'pptx':
        return <FileText size={16} />;
      case 'image':
        return <Image size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Study Library</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Study Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Session</DialogTitle>
              <DialogDescription>
                Give your study session a name to get started.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Enter session name"
              className="my-4"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.length === 0 ? (
          <Card className="col-span-full bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Book size={48} className="mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Study Sessions Yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first study session to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer transition-colors ${
                activeSession?.id === session.id ? 'border-primary' : ''
              }`}
              onClick={() => onSessionSelect(session)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{session.name}</CardTitle>
                <CardDescription>
                  {session.materials.length} material{session.materials.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ScrollArea className="h-24">
                  {session.materials.length > 0 ? (
                    session.materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        {getMaterialIcon(material.type)}
                        <span className="truncate">{material.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No materials added yet</p>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportSession(session);
                  }}
                >
                  <Download size={16} className="mr-1" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                >
                  <Trash size={16} className="mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {activeSession && activeSession.materials.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Materials in {activeSession.name}</h3>
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSession.materials.map((material) => (
              <Card
                key={material.id}
                className="cursor-pointer transition-colors hover:border-primary"
                onClick={() => onMaterialSelect(material)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getMaterialIcon(material.type)}
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMaterialDelete(activeSession.id, material.id);
                      }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                  <CardDescription className="capitalize">
                    {material.type} • {new Date(material.dateAdded).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate">
                    {material.summary || material.content.slice(0, 100) + '...'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyLibrary;
