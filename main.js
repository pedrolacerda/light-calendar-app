const { app, BrowserWindow, Menu, Tray, nativeTheme, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.ELECTRON_IS_DEV === '1';
let tray = null;
let win = null;
let isQuitting = false;
let currentTheme = 'dark';

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('ready', () => {
  // Hide dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Create tray icon
  const iconPath = path.join(__dirname, 'assets', 'tray-iconTemplate.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Light Calendar');

  // Create hidden browser window
  win = new BrowserWindow({
    width: 360,
    height: 345,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    transparent: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Track theme from renderer
  ipcMain.on('theme-updated', (_e, theme) => {
    currentTheme = theme;
    nativeTheme.themeSource = theme;
  });

  // Hide instead of close
  win.on('close', (e) => {
    if (isQuitting) {
      return;
    }

    e.preventDefault();
    win.hide();
  });

  // Hide when clicking outside (disabled in dev mode to keep DevTools usable)
  if (!isDev) {
    win.on('blur', () => {
      win.hide();
    });
  }

  const toggleWindow = () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      positionWindow();
      win.show();
    }
  };

  const buildContextMenu = () => Menu.buildFromTemplate([
    {
      label: win.isVisible() ? 'Hide Calendar' : 'Open Calendar',
      click: toggleWindow,
    },
    { type: 'separator' },
    {
      label: 'Theme',
      submenu: [
        {
          label: 'Dark',
          type: 'radio',
          checked: currentTheme === 'dark',
          click: () => {
            currentTheme = 'dark';
            nativeTheme.themeSource = 'dark';
            win.webContents.send('set-theme', 'dark');
          },
        },
        {
          label: 'Light',
          type: 'radio',
          checked: currentTheme === 'light',
          click: () => {
            currentTheme = 'light';
            nativeTheme.themeSource = 'light';
            win.webContents.send('set-theme', 'light');
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Quit Light Calendar',
      accelerator: 'Command+Q',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  // Left click toggles the popup, right click shows a menu with Quit.
  tray.on('click', toggleWindow);
  tray.on('right-click', () => {
    tray.popUpContextMenu(buildContextMenu());
  });

  console.log('Light Calendar is ready');
});

function positionWindow() {
  const trayBounds = tray.getBounds();
  const winBounds = win.getBounds();

  // Center window horizontally under the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height);

  win.setPosition(x, y, false);
}

app.on('window-all-closed', () => {
  // Don't quit — the app lives in the tray
});
