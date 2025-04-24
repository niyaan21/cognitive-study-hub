
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload } from 'lucide-react';
import { fileProcessorService } from '@/services/fileProcessorService';

interface FileUploaderProps {
  onFileProcessed: (processedFile: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setProcessingFile(file.name);
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);

      // Process the file
      const processedFile = await fileProcessorService.processFile(file);
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notify parent component
      onFileProcessed(processedFile);
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(`Failed to process file: ${err.message}`);
    } finally {
      setIsProcessing(false);
      // Reset after a delay
      setTimeout(() => {
        setProgress(0);
        setProcessingFile(null);
      }, 1500);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="w-full">
      <Card className="border-2 border-dashed bg-muted/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center py-8 ${
              isDragActive ? 'bg-primary/10' : ''
            } rounded-md cursor-pointer`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="flex flex-col space-y-1 text-center">
                <p className="text-xl font-medium">
                  Drag & drop your study material here
                </p>
                <p className="text-sm text-muted-foreground">
                  Support for PDF, DOCX, TXT, PPTX, audio, and image files
                </p>
              </div>
              <Button disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Select a file'}
              </Button>
            </div>
          </div>

          {isProcessing && processingFile && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingFile}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploader;
