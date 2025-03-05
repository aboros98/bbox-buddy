
import { BoundingBox } from "@/types/annotation";

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createNewBoundingBox = (x: number, y: number, label = "unlabeled"): BoundingBox => {
  return {
    id: generateUniqueId(),
    x,
    y,
    width: 100,
    height: 100,
    label
  };
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

export const formatJsonForExport = (dataset: any): string => {
  return JSON.stringify(dataset, null, 2);
};
