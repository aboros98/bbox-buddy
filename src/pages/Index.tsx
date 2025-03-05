
import React, { useState } from "react";
import Header from "@/components/Header";
import CanvasEditor from "@/components/CanvasEditor";
import ImageSelector from "@/components/ImageSelector";
import JsonEditor from "@/components/JsonEditor";
import Onboarding from "@/components/Onboarding";
import { Dataset, BoundingBox } from "@/types/annotation";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDatasetChange = (newDataset: Dataset) => {
    setDataset(newDataset);
  };

  const handleBoundingBoxesChange = (newBoxes: BoundingBox[]) => {
    if (!dataset) return;

    const updatedImages = [...dataset.images];
    updatedImages[currentImageIndex] = {
      ...updatedImages[currentImageIndex],
      boundingBoxes: newBoxes,
    };

    setDataset({
      ...dataset,
      images: updatedImages,
    });
  };

  if (!dataset) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Onboarding onComplete={handleDatasetChange} />
      </div>
    );
  }

  const currentImage = dataset.images[currentImageIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <CanvasEditor
              imageUrl={currentImage.filename}
              boundingBoxes={currentImage.boundingBoxes}
              onBoundingBoxesChange={handleBoundingBoxesChange}
            />
            
            <ImageSelector
              annotations={dataset.images}
              currentImageIndex={currentImageIndex}
              onImageSelect={setCurrentImageIndex}
            />
          </div>
          
          <div className="space-y-6">
            <JsonEditor
              dataset={dataset}
              onDatasetChange={handleDatasetChange}
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 bg-muted/40">
        <div className="container text-center text-sm text-muted-foreground">
          <p>BBox Buddy © {new Date().getFullYear()} - A minimalist annotation tool</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
