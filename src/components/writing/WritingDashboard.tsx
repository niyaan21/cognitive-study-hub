
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Search, Edit, Book, CalendarCheck } from "lucide-react";

const WritingDashboard = () => {
  const stats = [
    { title: "Documents Analyzed", value: "12", icon: <FileText className="h-5 w-5" /> },
    { title: "Grammar Issues Fixed", value: "237", icon: <Edit className="h-5 w-5" /> },
    { title: "AI Detection Checks", value: "8", icon: <Search className="h-5 w-5" /> },
    { title: "Exams Generated", value: "4", icon: <Book className="h-5 w-5" /> }
  ];

  const recentDocuments = [
    { title: "Physics Midterm Essay", type: "Essay", date: "2 days ago" },
    { title: "Application Email", type: "Email", date: "3 days ago" },
    { title: "Research Paper Draft", type: "Academic", date: "1 week ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
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
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently analyzed documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{doc.date}</span>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Writing Improvement</CardTitle>
            <CardDescription>Your progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <BarChart className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Writing improvement analytics</p>
              <Button variant="outline" size="sm">
                View detailed analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common writing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex flex-col gap-1">
                <FileText className="h-5 w-5" />
                <span>New Document</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1">
                <Edit className="h-5 w-5" />
                <span>Grammar Check</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1">
                <Book className="h-5 w-5" />
                <span>Create Exam</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-1">
                <CalendarCheck className="h-5 w-5" />
                <span>Essay Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WritingDashboard;
