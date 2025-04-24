
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { openRouterService } from '@/services/openRouterService';
import { Loader2 } from 'lucide-react';

interface GrammarIssue {
  id: string;
  type: string;
  text: string;
  suggestion: string;
  explanation: string;
}

const GrammarChecker = () => {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [improvedText, setImprovedText] = useState('');

  const handleCheck = async () => {
    if (!text.trim()) {
      toast.warning("Please enter text to check");
      return;
    }

    setIsChecking(true);
    setIssues([]);
    setImprovedText('');

    try {
      const prompt = `
        You are a professional grammar and writing checker. Analyze the following text for grammar, spelling, 
        punctuation, style, and clarity issues. Format your response as JSON with the following structure:
        {
          "issues": [
            {
              "id": "1",
              "type": "grammar|spelling|punctuation|style|clarity",
              "text": "the problematic text",
              "suggestion": "corrected version",
              "explanation": "brief explanation"
            }
          ],
          "improvedText": "the full corrected text"
        }
      `;

      const response = await openRouterService.chat([
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ]);

      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        if (data && data.issues && data.improvedText) {
          setIssues(data.issues);
          setImprovedText(data.improvedText);
          
          if (data.issues.length === 0) {
            toast.success("No grammar issues found!");
          } else {
            toast.info(`Found ${data.issues.length} issues to correct`);
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        toast.error("Failed to analyze text. Please try again.");
      }
    } catch (error) {
      console.error("Grammar check error:", error);
      toast.error("Failed to check grammar. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyCorrections = () => {
    if (improvedText) {
      setText(improvedText);
      toast.success("Applied all corrections");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text for grammar checking..."
          className="min-h-[200px]"
        />
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">{text.length} characters</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setText('')} disabled={isChecking || !text}>
              Clear
            </Button>
            <Button onClick={handleCheck} disabled={isChecking || !text}>
              {isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : 'Check Grammar'}
            </Button>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Found {issues.length} issues</h3>
            <Button onClick={handleApplyCorrections} variant="outline" size="sm">
              Apply All Corrections
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Suggestion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium capitalize">{issue.type}</TableCell>
                  <TableCell className="text-red-500">{issue.text}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-green-500">{issue.suggestion}</div>
                      <div className="text-xs text-muted-foreground">{issue.explanation}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Corrected Text</h4>
              <p className="text-sm whitespace-pre-wrap">{improvedText}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {issues.length === 0 && improvedText && (
        <Alert className="bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-900">
          <AlertTitle>Perfect!</AlertTitle>
          <AlertDescription>
            No grammar issues were found in your text.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GrammarChecker;
