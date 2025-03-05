
import { BoundingBox, Dataset, RawAnnotationDataset, LABEL_COLORS, LabelType } from "@/types/annotation";

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createNewBoundingBox = (x: number, y: number, label: LabelType = "unlabeled"): BoundingBox => {
  return {
    id: generateUniqueId(),
    x,
    y,
    width: 100,
    height: 100,
    label,
    color: LABEL_COLORS[label as keyof typeof LABEL_COLORS] || getRandomColor()
  };
};

export const getRandomColor = (): string => {
  const colors = Object.values(LABEL_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

export const normalizeCoordinates = (
  bbox: BoundingBox, 
  imageWidth: number, 
  imageHeight: number
): BoundingBox => {
  // Convert from pixel coordinates to normalized 0-1 coordinates
  return {
    ...bbox,
    x: bbox.x / imageWidth,
    y: bbox.y / imageHeight,
    width: bbox.width / imageWidth,
    height: bbox.height / imageHeight
  };
};

export const denormalizeCoordinates = (
  bbox: BoundingBox, 
  imageWidth: number, 
  imageHeight: number
): BoundingBox => {
  // Convert from normalized 0-1 coordinates to pixel coordinates
  return {
    ...bbox,
    x: bbox.x * imageWidth,
    y: bbox.y * imageHeight,
    width: bbox.width * imageWidth,
    height: bbox.height * imageHeight
  };
};

export const convertInternalToRawFormat = (dataset: Dataset): RawAnnotationDataset => {
  return dataset.images.map(image => {
    const bboxes = image.boundingBoxes.map(box => {
      // Convert from x, y, width, height to x1, y1, x2, y2 format
      return [
        Math.round(box.x),
        Math.round(box.y),
        Math.round(box.x + box.width),
        Math.round(box.y + box.height)
      ];
    });
    
    const labels = image.boundingBoxes.map(box => box.label);
    
    return {
      file: image.filename, // This will lose the original path, might need to store it separately
      annotation: {
        bboxes,
        labels
      }
    };
  });
};

export const formatJsonForExport = (dataset: any): string => {
  return JSON.stringify(dataset, null, 2);
};

// Get a label color, either from predefined colors or generate one
export const getLabelColor = (label: string): string => {
  return LABEL_COLORS[label as keyof typeof LABEL_COLORS] || getRandomColor();
};

// Get available label types from the defined colors
export const getAvailableLabelTypes = (): string[] => {
  return Object.keys(LABEL_COLORS);
};
