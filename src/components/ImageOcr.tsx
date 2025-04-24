
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { openRouterService } from '@/services/openRouterService';
import { fileProcessorService } from '@/services/fileProcessorService';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon } from "lucide-react";

interface ImageOcrProps {
  onContentProcessed: (processedContent: any) => void;
}

const ImageOcr: React.FC<ImageOcrProps> = ({ onContentProcessed }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText(null);
      setError(null);
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(selectedImage);
      
      // Extract text using OCR
      const text = await openRouterService.extractTextFromImage(base64);
      setExtractedText(text);
      
      // Process as study material
      const material = await fileProcessorService.createNote(
        `OCR: ${selectedImage.name}`, 
        text
      );
      
      onContentProcessed(material);
    } catch (err: any) {
      console.error('Error extracting text:', err);
      setError('Failed to extract text from image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon size={24} />
            <span>Select an image for OCR</span>
            <span className="text-xs text-muted-foreground">
              Supported formats: PNG, JPG, JPEG, WEBP
            </span>
          </div>
        </label>
        
        <Button
          onClick={handleExtractText}
          disabled={isLoading || !selectedImage}
        >
          {isLoading ? 'Processing...' : 'Extract Text'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {imagePreview && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Selected"
                className="max-h-[300px] object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {extractedText && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Extracted Text</h3>
            <ScrollArea className="h-[300px]">
              <Textarea 
                value={extractedText} 
                readOnly 
                className="min-h-[250px] w-full"
              />
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageOcr;
