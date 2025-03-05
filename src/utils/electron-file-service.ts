
import { Dataset, RawAnnotationDataset, convertRawToInternalFormat } from "@/types/annotation";
import { formatJsonForExport, convertInternalToRawFormat } from "./annotation-utils";

// Define a type for the window with Electron
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, func: (...args: any[]) => void) => (() => void);
        once: (channel: string, func: (...args: any[]) => void) => void;
      };
    };
  }
}

// Check if we're running in Electron
export const isElectron = (): boolean => {
  // Return true if window.electron exists (this will be injected by our preload script)
  return typeof window !== 'undefined' && window.electron !== undefined;
};

// Load a dataset from a JSON file using Electron's file dialog
export const loadDatasetFromFile = async (): Promise<Dataset | null> => {
  if (!isElectron()) {
    console.error('This function requires Electron');
    return null;
  }
  
  try {
    const result = await window.electron!.ipcRenderer.invoke('open-file-dialog');
    if (result && result.success && result.data) {
      const parsedData = JSON.parse(result.data) as RawAnnotationDataset;
      return convertRawToInternalFormat(parsedData);
    } else if (result && !result.success) {
      console.error('Failed to load dataset:', result.error);
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
    
    const result = await window.electron!.ipcRenderer.invoke('save-file-dialog', jsonData);
    if (result && result.success) {
      return true;
    } else {
      console.error('Failed to save dataset:', result.error);
      return false;
    }
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
    const result = await window.electron!.ipcRenderer.invoke('load-image', imagePath);
    if (result && result.success && result.path) {
      // For local files, we can use the file:// protocol
      return `file://${result.path}`;
    } else if (result && !result.success) {
      console.error('Failed to load image:', result.error);
    }
  } catch (error) {
    console.error('Failed to load image:', error);
  }
  
  return imagePath;
};
