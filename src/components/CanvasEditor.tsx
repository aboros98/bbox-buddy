import React, { useRef, useEffect, useState } from "react";
import { BoundingBox, LabelType, LABEL_COLORS } from "../types/annotation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createNewBoundingBox, generateUniqueId, getAvailableLabelTypes } from "@/utils/annotation-utils";
import { loadImageFromPath } from "@/utils/electron-file-service";

interface CanvasEditorProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  onBoundingBoxesChange: (boundingBoxes: BoundingBox[]) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ imageUrl, boundingBoxes, onBoundingBoxesChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [newBox, setNewBox] = useState<BoundingBox | null>(null);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState(imageUrl);

  useEffect(() => {
    const loadImage = async () => {
      const path = await loadImageFromPath(imageUrl);
      setLoadedImageUrl(path);
    };

    loadImage();
  }, [imageUrl]);

  useEffect(() => {
    if (loadedImageUrl) {
      const img = new Image();
      img.src = loadedImageUrl;
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Error loading image:", loadedImageUrl);
        setImageLoaded(false);
      };
    }
  }, [loadedImageUrl]);

  useEffect(() => {
    if (canvasRef.current && imageLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const image = imageRef.current;
      if (!image) return;

      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0, image.width, image.height);

      // Draw bounding boxes
      boundingBoxes.forEach(box => {
        ctx.strokeStyle = box.color || "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Add label
        ctx.font = "14px sans-serif";
        ctx.fillStyle = box.color || "red";
        const textWidth = ctx.measureText(box.label).width;
        const textX = box.x + 5;
        const textY = box.y + 16;

        // Draw background for label
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(box.x, box.y - 14, textWidth + 10, 18);

        // Draw label text
        ctx.fillStyle = "white";
        ctx.fillText(box.label, textX, textY);
      });
    }
  }, [boundingBoxes, imageLoaded, loadedImageUrl]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPosition({ x, y });

    const newId = generateUniqueId();
    setNewBox({
      id: newId,
      x,
      y,
      width: 0,
      height: 0,
      label: "unlabeled",
      color: LABEL_COLORS["unlabeled"]
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !newBox) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPosition.x;
    const height = y - startPosition.y;

    setNewBox({
      ...newBox,
      width,
      height
    });

    // Redraw everything
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = imageRef.current;
    if (!image) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Redraw existing bounding boxes
    boundingBoxes.forEach(box => {
      ctx.strokeStyle = box.color || "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Add label
      ctx.font = "14px sans-serif";
      ctx.fillStyle = box.color || "red";
      const textWidth = ctx.measureText(box.label).width;
      const textX = box.x + 5;
      const textY = box.y + 16;

      // Draw background for label
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(box.x, box.y - 14, textWidth + 10, 18);

      // Draw label text
      ctx.fillStyle = "white";
      ctx.fillText(box.label, textX, textY);
    });

    // Draw the new bounding box
    ctx.strokeStyle = newBox.color || "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(newBox.x, newBox.y, width, height);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!newBox) return;

    // Finalize the bounding box
    const finalBox = {
      ...newBox,
      width: Math.abs(newBox.width),
      height: Math.abs(newBox.height),
      x: newBox.width > 0 ? newBox.x : newBox.x + newBox.width,
      y: newBox.height > 0 ? newBox.y : newBox.y + newBox.height
    };

    onBoundingBoxesChange([...boundingBoxes, finalBox]);
    setNewBox(null);
  };

  const handleBoxClick = (box: BoundingBox) => {
    setSelectedBox(box);
  };

  const handleLabelChange = (label: LabelType) => {
    if (!selectedBox) return;

    const updatedBoxes = boundingBoxes.map(box =>
      box.id === selectedBox.id ? { ...box, label, color: LABEL_COLORS[label as keyof typeof LABEL_COLORS] || box.color } : box
    );
    onBoundingBoxesChange(updatedBoxes);
    setSelectedBox(null);
  };

  const handleDeleteBox = () => {
    if (!selectedBox) return;

    const updatedBoxes = boundingBoxes.filter(box => box.id !== selectedBox.id);
    onBoundingBoxesChange(updatedBoxes);
    setSelectedBox(null);
  };

  const availableLabels = getAvailableLabelTypes();

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ maxWidth: '100%', maxHeight: '600px' }}
      />

      {selectedBox && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Edit Label</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Label</h4>
                <p className="text-sm text-muted-foreground">
                  Change the label for the selected bounding box.
                </p>
              </div>
              <div className="grid gap-2">
                <Select onValueChange={(value) => handleLabelChange(value as LabelType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBox.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLabels.map(label => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteBox}>
                Delete Bounding Box
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default CanvasEditor;
