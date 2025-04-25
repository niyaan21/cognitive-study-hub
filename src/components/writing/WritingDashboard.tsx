
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Search, Edit, Book, CalendarCheck } from "lucide-react";
import { storageService } from '@/services/storageService';
import { StudyMaterial } from '@/services/fileProcessorService';

const WritingDashboard = () => {
  const [documentsCount, setDocumentsCount] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<{title: string, type: string, date: string}[]>([]);

  useEffect(() => {
    // Get real data from storage service
    const userSessions = storageService.getSessions();
    setSessions(userSessions);
    
    let totalDocs = 0;
    let allMaterials: StudyMaterial[] = [];
    
    // Calculate total documents and collect all materials
    userSessions.forEach(session => {
      if (session.materials && Array.isArray(session.materials)) {
        totalDocs += session.materials.length;
        allMaterials = [...allMaterials, ...session.materials];
      }
    });
    
    setDocumentsCount(totalDocs);
    
    // Get recent documents (sorted by date if available)
    const sortedMaterials = allMaterials.sort((a, b) => {
      const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return dateB - dateA;
    });
    
    // Format the materials for display
    const recentDocs = sortedMaterials.slice(0, 3).map(material => {
      const daysAgo = material.dateAdded 
        ? getDaysAgo(new Date(material.dateAdded)) 
        : 'Recently';
      
      return {
        title: material.name || 'Unnamed Document',
        type: material.type || 'Document',
        date: daysAgo
      };
    });
    
    setRecentDocuments(recentDocs.length > 0 ? recentDocs : []);
  }, []);

  // Helper function to calculate days ago
  const getDaysAgo = (date: Date): string => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Generate stats data based on user activity
  const stats = [
    { 
      title: "Documents", 
      value: documentsCount.toString(), 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      title: "Study Sessions", 
      value: sessions.length.toString(), 
      icon: <Book className="h-5 w-5" /> 
    },
    { 
      title: "Writing Projects", 
      value: "0", 
      icon: <Edit className="h-5 w-5" /> 
    },
    { 
      title: "Exams Created", 
      value: "0", 
      icon: <CalendarCheck className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-fade-in hover-scale transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently added study materials</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between hover:bg-accent/10 p-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{doc.date}</span>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-2 opacity-50" />
                <p>No documents yet</p>
                <p className="text-sm">Upload study materials to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Writing Progress</CardTitle>
            <CardDescription>Track your writing improvements</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <BarChart className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Start creating documents to track your progress</p>
              <Button variant="outline" size="sm">
                Create new document
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 animate-fade-in">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common writing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200">
                <FileText className="h-5 w-5" />
                <span>New Document</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200">
                <Edit className="h-5 w-5" />
                <span>Grammar Check</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200">
                <Book className="h-5 w-5" />
                <span>Create Exam</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1 hover-scale transition-all duration-200">
                <Search className="h-5 w-5" />
                <span>AI Detection</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WritingDashboard;
