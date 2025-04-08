const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let nextProcess;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Iniciar o servidor Next.js
  if (isDev) {
    nextProcess = spawn('npm', ['run', 'dev'], { shell: true });
    
    nextProcess.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
    });
    
    nextProcess.stderr.on('data', (data) => {
      console.error(`Next.js error: ${data}`);
    });
    
    // Aguardar o servidor Next.js iniciar
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 5000);
  } else {
    // Em produção, carregar a versão compilada
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  }

  // Abrir o DevTools em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nextProcess) {
      nextProcess.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 