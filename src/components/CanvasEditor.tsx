
import React, { useRef, useState, useEffect } from "react";
import { BoundingBox } from "@/types/annotation";
import { createNewBoundingBox } from "@/utils/annotation-utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash, Plus, MousePointer } from "lucide-react";

interface CanvasEditorProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  onBoundingBoxesChange: (boundingBoxes: BoundingBox[]) => void;
}

type EditorMode = "select" | "create";

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
      setMode("select");
      toast.success("New bounding box created");
    }
  };

  const handleBoxMouseDown = (
    e: React.MouseEvent,
    boxId: string,
    resizeHandle?: string
  ) => {
    e.stopPropagation();
    setSelectedBoxId(boxId);

    if (resizeHandle) {
      setIsResizing(true);
      setResizeDirection(resizeHandle);
    } else {
      setIsDragging(true);
    }

    setDragStartPos(getRelativeCoordinates(e.clientX, e.clientY));
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

  const updateBoxLabel = (boxId: string, newLabel: string) => {
    const updatedBoxes = boundingBoxes.map((box) =>
      box.id === boxId ? { ...box, label: newLabel } : box
    );
    onBoundingBoxesChange(updatedBoxes);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === "select" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("select")}
          className="flex items-center gap-1"
        >
          <MousePointer className="h-4 w-4" />
          Select
        </Button>
        <Button
          variant={mode === "create" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("create")}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Box
        </Button>
        {selectedBoxId && (
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelectedBox}
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <div
        ref={canvasRef}
        className="relative border rounded-lg overflow-hidden bg-white"
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
          return (
            <div
              key={box.id}
              className={`annotation-box ${
                isSelected ? "border-primary" : "border-blue-400/70"
              }`}
              style={{
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
                zIndex: isSelected ? 10 : 1,
              }}
              onMouseDown={(e) => handleBoxMouseDown(e, box.id)}
            >
              {/* Label */}
              <div className="annotation-label">
                <input
                  type="text"
                  value={box.label}
                  onChange={(e) => updateBoxLabel(box.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none outline-none"
                />
              </div>
              
              {/* Resize handles (only show when selected) */}
              {isSelected && (
                <>
                  <div
                    className="annotation-handle top-0 left-0"
                    style={{ transform: "translate(-50%, -50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "nw")}
                  ></div>
                  <div
                    className="annotation-handle top-0 left-1/2"
                    style={{ transform: "translate(-50%, -50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "n")}
                  ></div>
                  <div
                    className="annotation-handle top-0 right-0"
                    style={{ transform: "translate(50%, -50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "ne")}
                  ></div>
                  <div
                    className="annotation-handle top-1/2 right-0"
                    style={{ transform: "translate(50%, -50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "e")}
                  ></div>
                  <div
                    className="annotation-handle bottom-0 right-0"
                    style={{ transform: "translate(50%, 50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "se")}
                  ></div>
                  <div
                    className="annotation-handle bottom-0 left-1/2"
                    style={{ transform: "translate(-50%, 50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "s")}
                  ></div>
                  <div
                    className="annotation-handle bottom-0 left-0"
                    style={{ transform: "translate(-50%, 50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "sw")}
                  ></div>
                  <div
                    className="annotation-handle top-1/2 left-0"
                    style={{ transform: "translate(-50%, -50%)" }}
                    onMouseDown={(e) => handleBoxMouseDown(e, box.id, "w")}
                  ></div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CanvasEditor;
