
export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface ImageAnnotation {
  filename: string;
  boundingBoxes: BoundingBox[];
}

export interface Dataset {
  images: ImageAnnotation[];
}
