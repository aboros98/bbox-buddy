
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { toast } from "sonner";
import { Dataset, ImageAnnotation } from "@/types/annotation";

interface OnboardingProps {
  onComplete: (dataset: Dataset) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [dragActive, setDragActive] = useState(false);

  const loadSampleData = () => {
    // Create a simple demo dataset with placeholder images
    const demoDataset: Dataset = {
      images: [
        {
          filename: "https://images.unsplash.com/photo-1566197341759-47f74d6caee1",
          boundingBoxes: [
            {
              id: "box1",
              x: 100,
              y: 100,
              width: 200,
              height: 150,
              label: "cat"
            }
          ]
        },
        {
          filename: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01",
          boundingBoxes: [
            {
              id: "box2",
              x: 150,
              y: 120,
              width: 180,
              height: 220,
              label: "dog"
            }
          ]
        },
        {
          filename: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
          boundingBoxes: [
            {
              id: "box3",
              x: 120,
              y: 80,
              width: 240,
              height: 200,
              label: "dog"
            },
            {
              id: "box4",
              x: 400,
              y: 120,
              width: 100,
              height: 80,
              label: "ball"
            }
          ]
        }
      ]
    };
    onComplete(demoDataset);
    toast.success("Demo dataset loaded");
  };

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          
          // Validate JSON format
          if (!json.images || !Array.isArray(json.images)) {
            toast.error("Invalid JSON structure. Expected 'images' array.");
            return;
          }
          
          onComplete(json);
          toast.success("JSON file loaded successfully");
        } catch (e) {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/json") {
        toast.error("Please upload a JSON file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          
          // Validate JSON format
          if (!json.images || !Array.isArray(json.images)) {
            toast.error("Invalid JSON structure. Expected 'images' array.");
            return;
          }
          
          onComplete(json);
          toast.success("JSON file loaded successfully");
        } catch (e) {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to BBox Buddy</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4 transition-all duration-200 ${
              dragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center">
              <Image className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop your annotation JSON file here, or
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload JSON
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-muted-foreground mb-2">
            Don't have a JSON file? Try our demo dataset to get started.
          </p>
          <Button variant="ghost" onClick={loadSampleData}>
            Load Demo Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
