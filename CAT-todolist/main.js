const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

app.setAppUserModelId("com.github.ZOUZOU020.cattodolist");

let mainWindow;
let tray = null;

function createTray() {
    tray = new Tray(path.join(__dirname, 'new-icon.ico'));
    updateTrayMenu();

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

function updateTrayMenu() {
    // 确保 mainWindow 已经创建并且 isGhostMode 属性可用
    const currentIsGhostMode = mainWindow ? mainWindow.isGhostMode : false;
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '顯示/隱藏',
            click: function () {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            },
        },
        {
            label: currentIsGhostMode ? '關閉穿透模式' : '開啟穿透模式',
            click: function () {
                // 在托盘菜单中调用 toggleGhostMode 时，需要传递 mainWindow
                if (mainWindow) {
                    toggleGhostMode(mainWindow);
                }
            }
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
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 600,
    frame: false,
    transparent: true,
    title: 'CAT-todolist',
    icon: path.join(__dirname, 'new-icon.ico'), // Replace 'new-icon.ico' with your icon file
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

  // Listen for keyboard events to exit ghost mode with ESC
  ipcMain.on('keydown', (event, key) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender);
    console.log(`[ipcMain-keydown] Key: ${key}, isGhostMode: ${currentWindow.isGhostMode}`);
    if (key === 'Escape' && currentWindow.isGhostMode) {
      toggleGhostMode(currentWindow);
    }
  });

  mainWindow.isGhostMode = false; // Initialize isGhostMode after mainWindow is defined
}

app.on('ready', () => {
  createWindow();
  createTray();
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



  function toggleGhostMode(win) {
    console.log(`[toggleGhostMode] Before: isGhostMode = ${win.isGhostMode}`);
    win.isGhostMode = !win.isGhostMode;
    console.log(`[toggleGhostMode] After: isGhostMode = ${win.isGhostMode}`);
    if (win.isGhostMode) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
        mainWindow.setIgnoreMouseEvents(false);
        mainWindow.setAlwaysOnTop(false);
    }
    win.webContents.send('ghost-mode-state', win.isGhostMode);
    updateTrayMenu();
  }

  ipcMain.on('toggle-ghost-mode', (event) => {
    toggleGhostMode(BrowserWindow.fromWebContents(event.sender));
  });

ipcMain.on('close-app', () => {
    app.quit();
});