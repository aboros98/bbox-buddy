
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, load the built app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  } else {
    // In dev mode, load from the dev server
    mainWindow.loadURL('http://localhost:8080/');
    // Enable DevTools in development mode
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file operations
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    if (!canceled && filePaths.length > 0) {
      const filePath = filePaths[0];
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        return { success: true, path: filePath, data };
      } catch (error) {
        console.error('Failed to read file', error);
        return { success: false, error: 'Failed to read file' };
      }
    }
    return { success: false, error: 'Operation canceled' };
  } catch (error) {
    console.error('Error in open-file-dialog:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('save-file-dialog', async (_, data) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    if (!canceled && filePath) {
      try {
        fs.writeFileSync(filePath, data);
        return { success: true, path: filePath };
      } catch (error) {
        console.error('Failed to save file', error);
        return { success: false, error: 'Failed to save file' };
      }
    }
    return { success: false, error: 'Operation canceled' };
  } catch (error) {
    console.error('Error in save-file-dialog:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('load-image', async (_, imagePath) => {
  try {
    // Check if file exists
    fs.accessSync(imagePath, fs.constants.F_OK);
    // Return the file path that can be loaded
    return { success: true, path: imagePath };
  } catch (error) {
    // File doesn't exist, try to resolve relative to directory
    console.error('Image not found at path:', imagePath);
    return { success: false, error: 'Image not found' };
  }
});
