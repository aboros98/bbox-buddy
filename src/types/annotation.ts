
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

// Function to generate unique IDs for bounding boxes
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Function to get a random color from the predefined colors
const getRandomColor = (): string => {
  const colors = Object.values(LABEL_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

// Convert raw format to internal format
export const convertRawToInternalFormat = (rawData: RawAnnotationDataset): Dataset => {
  const images = rawData.map(item => {
    // Extract just the filename from the full path
    const filename = item.file.split('/').pop() || item.file;
    
    const boundingBoxes: BoundingBox[] = item.annotation.bboxes.map((bbox, index) => {
      // bbox format is [x1, y1, x2, y2]
      const x = bbox[0];
      const y = bbox[1];
      const width = bbox[2] - bbox[0];
      const height = bbox[3] - bbox[1];
      const label = item.annotation.labels[index] || "unlabeled";
      
      return {
        id: generateUniqueId(),
        x,
        y,
        width,
        height,
        label,
        color: LABEL_COLORS[label as keyof typeof LABEL_COLORS] || getRandomColor()
      };
    });
    
    return {
      filename,
      boundingBoxes
    };
  });
  
  return { images };
};
