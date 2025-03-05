import React from "react";
import { useState, useEffect } from "react";
import { ImageAnnotation } from "@/types/annotation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSelectorProps {
  annotations: ImageAnnotation[];
  currentImageIndex: number;
  onImageSelect: (index: number) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  annotations,
  currentImageIndex,
  onImageSelect,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      onImageSelect(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < annotations.length - 1) {
      onImageSelect(currentImageIndex + 1);
    }
  };

  // Auto-scroll to keep the selected image in view
  useEffect(() => {
    const selectedElement = document.getElementById(`image-${currentImageIndex}`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentImageIndex]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Image Gallery</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentImageIndex === annotations.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-24 border rounded-lg bg-white">
        <div className="flex gap-2 p-2">
          {annotations.map((annotation, index) => (
            <div
              id={`image-${index}`}
              key={index}
              onClick={() => onImageSelect(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "relative cursor-pointer rounded-md overflow-hidden transition-all duration-200 ease-in-out",
                "min-w-[80px] h-[80px] border-2",
                index === currentImageIndex
                  ? "border-primary scale-105 shadow-md"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <img
                src={annotation.filename}
                alt={`Image ${index}`}
                className="w-full h-full object-cover"
              />
              <div 
                className={cn(
                  "absolute inset-0 bg-primary/10 flex items-center justify-center",
                  index === currentImageIndex || hoveredIndex === index ? "opacity-100" : "opacity-0",
                  "transition-opacity duration-200"
                )}
              >
                <span className="text-xs font-medium bg-background/90 text-foreground px-1.5 py-0.5 rounded">
                  {index + 1} / {annotations.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ImageSelector;
