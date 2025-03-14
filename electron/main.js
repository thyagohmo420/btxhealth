import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import Store from 'electron-store';

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    },
    icon: join(__dirname, '../public/icon.ico')
  });

  // Em desenvolvimento, carrega o servidor local
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // Em produção, carrega o build
    win.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Configurar sincronização offline
  ipcMain.on('save-offline-data', (event, data) => {
    store.set('offlineData', data);
  });

  ipcMain.on('load-offline-data', (event) => {
    event.reply('offline-data-loaded', store.get('offlineData'));
  });

  // Configurar atualizações automáticas
  ipcMain.on('check-for-updates', (event) => {
    // Implementar lógica de verificação de atualizações
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Configurar menu personalizado
const { Menu } = require('electron');

const template = [
  {
    label: 'Arquivo',
    submenu: [
      { role: 'quit', label: 'Sair' }
    ]
  },
  {
    label: 'Editar',
    submenu: [
      { role: 'undo', label: 'Desfazer' },
      { role: 'redo', label: 'Refazer' },
      { type: 'separator' },
      { role: 'cut', label: 'Recortar' },
      { role: 'copy', label: 'Copiar' },
      { role: 'paste', label: 'Colar' }
    ]
  },
  {
    label: 'Visualizar',
    submenu: [
      { role: 'reload', label: 'Recarregar' },
      { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvimento' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Zoom Padrão' },
      { role: 'zoomIn', label: 'Aumentar Zoom' },
      { role: 'zoomOut', label: 'Diminuir Zoom' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tela Cheia' }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => {
          // Implementar janela Sobre
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);