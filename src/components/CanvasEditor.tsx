
import React, { useRef, useState, useEffect } from "react";
import { BoundingBox, LABEL_COLORS, LabelType } from "@/types/annotation";
import { createNewBoundingBox, getLabelColor, getAvailableLabelTypes } from "@/utils/annotation-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Pencil, Trash, Plus, MousePointer, Copy, 
  MoveHorizontal, ChevronDown, Palette, Tag
} from "lucide-react";

interface CanvasEditorProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  onBoundingBoxesChange: (boundingBoxes: BoundingBox[]) => void;
}

type EditorMode = "select" | "create" | "delete";

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  imageUrl,
  boundingBoxes,
  onBoundingBoxesChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [mode, setMode] = useState<EditorMode>("select");
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState("");
  const [availableLabels, setAvailableLabels] = useState<string[]>(getAvailableLabelTypes());

  useEffect(() => {
    const handleImageLoad = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };

    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener("load", handleImageLoad);
      }
    }

    return () => {
      img?.removeEventListener("load", handleImageLoad);
    };
  }, [imageUrl]);

  // Update available labels from existing boxes
  useEffect(() => {
    const existingLabels = boundingBoxes.map(box => box.label);
    const uniqueLabels = [...new Set([...getAvailableLabelTypes(), ...existingLabels])];
    setAvailableLabels(uniqueLabels);
  }, [boundingBoxes]);

  const getRelativeCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode === "create") {
      const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
      const newBox = createNewBoundingBox(x, y);
      onBoundingBoxesChange([...boundingBoxes, newBox]);
      setSelectedBoxId(newBox.id);
      toast.success("New bounding box created");
    } else if (mode === "delete" && selectedBoxId) {
      deleteSelectedBox();
    }
  };

  const handleBoxClick = (e: React.MouseEvent, boxId: string) => {
    e.stopPropagation();
    setSelectedBoxId(boxId);
    if (mode === "delete") {
      const updatedBoxes = boundingBoxes.filter((box) => box.id !== boxId);
      onBoundingBoxesChange(updatedBoxes);
      setSelectedBoxId(null);
      toast.success("Bounding box deleted");
    }
  };

  const handleBoxMouseDown = (
    e: React.MouseEvent,
    boxId: string,
    resizeHandle?: string
  ) => {
    e.stopPropagation();
    setSelectedBoxId(boxId);

    if (mode === "select") {
      if (resizeHandle) {
        setIsResizing(true);
        setResizeDirection(resizeHandle);
      } else {
        setIsDragging(true);
      }
      setDragStartPos(getRelativeCoordinates(e.clientX, e.clientY));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const currentPos = getRelativeCoordinates(e.clientX, e.clientY);
    const deltaX = currentPos.x - dragStartPos.x;
    const deltaY = currentPos.y - dragStartPos.y;

    if (isDragging && selectedBoxId) {
      const updatedBoxes = boundingBoxes.map((box) =>
        box.id === selectedBoxId
          ? { ...box, x: box.x + deltaX, y: box.y + deltaY }
          : box
      );
      onBoundingBoxesChange(updatedBoxes);
    } else if (isResizing && selectedBoxId) {
      const boxToResize = boundingBoxes.find((box) => box.id === selectedBoxId);
      if (!boxToResize) return;

      let newWidth = boxToResize.width;
      let newHeight = boxToResize.height;
      let newX = boxToResize.x;
      let newY = boxToResize.y;

      if (resizeDirection.includes("e")) {
        newWidth = Math.max(20, boxToResize.width + deltaX);
      }
      if (resizeDirection.includes("w")) {
        const possibleWidth = Math.max(20, boxToResize.width - deltaX);
        if (possibleWidth !== boxToResize.width) {
          newX = boxToResize.x + deltaX;
          newWidth = possibleWidth;
        }
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(20, boxToResize.height + deltaY);
      }
      if (resizeDirection.includes("n")) {
        const possibleHeight = Math.max(20, boxToResize.height - deltaY);
        if (possibleHeight !== boxToResize.height) {
          newY = boxToResize.y + deltaY;
          newHeight = possibleHeight;
        }
      }

      const updatedBoxes = boundingBoxes.map((box) =>
        box.id === selectedBoxId
          ? { ...box, x: newX, y: newY, width: newWidth, height: newHeight }
          : box
      );
      onBoundingBoxesChange(updatedBoxes);
    }

    setDragStartPos(currentPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const deleteSelectedBox = () => {
    if (selectedBoxId) {
      const updatedBoxes = boundingBoxes.filter(
        (box) => box.id !== selectedBoxId
      );
      onBoundingBoxesChange(updatedBoxes);
      setSelectedBoxId(null);
      toast.success("Bounding box deleted");
    }
  };

  const duplicateSelectedBox = () => {
    if (selectedBoxId) {
      const boxToDuplicate = boundingBoxes.find(box => box.id === selectedBoxId);
      if (boxToDuplicate) {
        const newBox = {
          ...boxToDuplicate,
          id: createNewBoundingBox(0, 0).id,
          x: boxToDuplicate.x + 20,
          y: boxToDuplicate.y + 20
        };
        onBoundingBoxesChange([...boundingBoxes, newBox]);
        setSelectedBoxId(newBox.id);
        toast.success("Bounding box duplicated");
      }
    }
  };

  const updateBoxLabel = (boxId: string, newLabel: string) => {
    const updatedBoxes = boundingBoxes.map((box) =>
      box.id === boxId 
        ? { 
            ...box, 
            label: newLabel,
            color: getLabelColor(newLabel)
          } 
        : box
    );
    onBoundingBoxesChange(updatedBoxes);
  };

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === "select" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("select")}
                    className="flex items-center gap-1"
                  >
                    <MousePointer className="h-4 w-4" />
                    Select
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select and move bounding boxes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === "create" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("create")}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Box
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new bounding box</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mode === "delete" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("delete")}
                    className="flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete bounding boxes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {selectedBoxId && (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={duplicateSelectedBox}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate selected box</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {selectedBoxId && (
                <Select 
                  onValueChange={(value) => {
                    if (selectedBoxId) updateBoxLabel(selectedBoxId, value);
                  }}
                  value={boundingBoxes.find(box => box.id === selectedBoxId)?.label || ""}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <SelectValue placeholder="Select label" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableLabels.map(label => (
                      <SelectItem key={label} value={label}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getLabelColor(label) }}
                          ></div>
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <div
          ref={canvasRef}
          className="relative border rounded-lg overflow-hidden bg-white flex items-center justify-center"
          style={{ maxWidth: "100%", maxHeight: "70vh" }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Annotation canvas"
            className="max-w-full max-h-[70vh] object-contain"
            draggable={false}
          />

          {boundingBoxes.map((box) => {
            const isSelected = box.id === selectedBoxId;
            const boxColor = box.color || getLabelColor(box.label);
            
            return (
              <div
                key={box.id}
                className={`annotation-box ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                  border: `2px solid ${boxColor}`,
                  backgroundColor: `${boxColor}20`,
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={(e) => handleBoxClick(e, box.id)}
                onMouseDown={(e) => handleBoxMouseDown(e, box.id)}
              >
                {/* Label */}
                <div className="annotation-label" style={{ backgroundColor: boxColor }}>
                  <span className="px-1 text-white whitespace-nowrap">{box.label}</span>
                </div>
                
                {/* Resize handles (only show when selected) */}
                {isSelected && mode === "select" && (
                  <>
                    <div
                      className="annotation-handle top-0 left-0"
                      style={{ 
                        transform: "translate(-50%, -50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "nw")}
                    ></div>
                    <div
                      className="annotation-handle top-0 left-1/2"
                      style={{ 
                        transform: "translate(-50%, -50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "n")}
                    ></div>
                    <div
                      className="annotation-handle top-0 right-0"
                      style={{ 
                        transform: "translate(50%, -50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "ne")}
                    ></div>
                    <div
                      className="annotation-handle top-1/2 right-0"
                      style={{ 
                        transform: "translate(50%, -50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "e")}
                    ></div>
                    <div
                      className="annotation-handle bottom-0 right-0"
                      style={{ 
                        transform: "translate(50%, 50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "se")}
                    ></div>
                    <div
                      className="annotation-handle bottom-0 left-1/2"
                      style={{ 
                        transform: "translate(-50%, 50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "s")}
                    ></div>
                    <div
                      className="annotation-handle bottom-0 left-0"
                      style={{ 
                        transform: "translate(-50%, 50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "sw")}
                    ></div>
                    <div
                      className="annotation-handle top-1/2 left-0"
                      style={{ 
                        transform: "translate(-50%, -50%)",
                        borderColor: boxColor 
                      }}
                      onMouseDown={(e) => handleBoxMouseDown(e, box.id, "w")}
                    ></div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Total annotations: {boundingBoxes.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasEditor;
