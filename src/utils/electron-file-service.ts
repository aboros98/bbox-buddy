
import { BoundingBox, Dataset, RawAnnotationDataset, convertRawToInternalFormat } from "@/types/annotation";
import { formatJsonForExport, convertInternalToRawFormat } from "./annotation-utils";

// Check if we're running in Electron
export const isElectron = (): boolean => {
  return window && window.process && window.process.type === 'renderer';
};

// Load a dataset from a JSON file using Electron's file dialog
export const loadDatasetFromFile = async (): Promise<Dataset | null> => {
  if (!isElectron()) {
    console.error('This function requires Electron');
    return null;
  }
  
  try {
    // @ts-ignore - using Electron's IPC renderer
    const result = await window.electron.ipcRenderer.invoke('open-file-dialog');
    if (result && result.data) {
      const parsedData = JSON.parse(result.data) as RawAnnotationDataset;
      return convertRawToInternalFormat(parsedData);
    }
  } catch (error) {
    console.error('Failed to load dataset:', error);
  }
  
  return null;
};

// Save a dataset to a JSON file using Electron's file dialog
export const saveDatasetToFile = async (dataset: Dataset): Promise<boolean> => {
  if (!isElectron()) {
    console.error('This function requires Electron');
    return false;
  }
  
  try {
    const rawData = convertInternalToRawFormat(dataset);
    const jsonData = formatJsonForExport(rawData);
    
    // @ts-ignore - using Electron's IPC renderer
    const result = await window.electron.ipcRenderer.invoke('save-file-dialog', jsonData);
    return result.success;
  } catch (error) {
    console.error('Failed to save dataset:', error);
    return false;
  }
};

// Load an image from the file system using its path
export const loadImageFromPath = async (imagePath: string): Promise<string> => {
  if (!isElectron()) {
    console.error('This function requires Electron');
    return imagePath; // Just return the original path in web mode
  }
  
  try {
    // @ts-ignore - using Electron's IPC renderer
    const result = await window.electron.ipcRenderer.invoke('load-image', imagePath);
    if (result.path) {
      // For local files, we can use the file:// protocol
      return `file://${result.path}`;
    }
  } catch (error) {
    console.error('Failed to load image:', error);
  }
  
  return imagePath;
};
