const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 600,
    frame: false,
    transparent: true,
    title: 'CAT-todolist',
    icon: path.join(__dirname, 'new-icon.png'), // Replace 'new-icon.png' with your icon file
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true, 'floating');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.on('move', () => {
    mainWindow.webContents.send('window-moved');
  });
}

app.on('ready', () => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'new-icon.png')); // Replace 'new-icon.png' with your icon file
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '顯示/隱藏',
      click: function () {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },

    {
      label: '離開',
      click: function () {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip('To-Do List');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  })
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('set-opacity', (event, opacity) => {
    mainWindow.setOpacity(parseFloat(opacity));
});

ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
    mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
});

ipcMain.on('close-app', () => {
    app.quit();
});