
import React, { useState } from "react";
import Header from "@/components/Header";
import CanvasEditor from "@/components/CanvasEditor";
import ImageSelector from "@/components/ImageSelector";
import JsonEditor from "@/components/JsonEditor";
import Onboarding from "@/components/Onboarding";
import { Dataset, BoundingBox, RawAnnotationDataset } from "@/types/annotation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { loadDatasetFromFile, isElectron } from "@/utils/electron-file-service";
import { toast } from "sonner";

const Index = () => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDatasetChange = (newDataset: Dataset) => {
    setDataset(newDataset);
  };

  const handleRawDatasetUpload = (rawData: RawAnnotationDataset) => {
    import("@/types/annotation").then(({ convertRawToInternalFormat }) => {
      const convertedData = convertRawToInternalFormat(rawData);
      setDataset(convertedData);
    });
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

  const handleOpenDatasetFile = async () => {
    try {
      const loadedDataset = await loadDatasetFromFile();
      if (loadedDataset) {
        setDataset(loadedDataset);
        toast.success("Dataset loaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to load dataset");
      console.error(error);
    }
  };

  if (!dataset) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container py-6 px-4 max-w-7xl mx-auto">
          {isElectron() && (
            <div className="mb-6">
              <Button onClick={handleOpenDatasetFile} className="w-full mb-4">
                Open Dataset File
              </Button>
              <Separator className="my-4" />
            </div>
          )}
          <Onboarding onComplete={handleDatasetChange} onRawDataUpload={handleRawDatasetUpload} />
        </div>
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
            <h2 className="text-2xl font-bold tracking-tight">
              Image Editor
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Image {currentImageIndex + 1} of {dataset.images.length})
              </span>
            </h2>
            
            <CanvasEditor
              imageUrl={currentImage.filename}
              boundingBoxes={currentImage.boundingBoxes}
              onBoundingBoxesChange={handleBoundingBoxesChange}
            />
            
            <Card>
              <CardContent className="p-4">
                <ImageSelector
                  annotations={dataset.images}
                  currentImageIndex={currentImageIndex}
                  onImageSelect={setCurrentImageIndex}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Data View</h2>
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
