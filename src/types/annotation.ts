
export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color?: string;
}

export interface ImageAnnotation {
  filename: string;
  boundingBoxes: BoundingBox[];
}

export interface Dataset {
  images: ImageAnnotation[];
}

// Format matching your input JSON
export interface RawAnnotationItem {
  file: string;
  annotation: {
    bboxes: number[][];
    labels: string[];
  }
}

export type RawAnnotationDataset = RawAnnotationItem[];

// Predefined label colors for consistency
export const LABEL_COLORS = {
  "road signs": "#8B5CF6", // Vivid Purple
  "traffic signs": "#0EA5E9", // Ocean Blue
  "driving signs": "#F97316", // Bright Orange
  "unlabeled": "#8E9196", // Neutral Gray
};

export type LabelType = keyof typeof LABEL_COLORS | string;
