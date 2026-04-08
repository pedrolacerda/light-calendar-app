const { app, BrowserWindow, Tray, nativeImage, nativeTheme, screen } = require('electron');
const path = require('path');

const isDev = process.env.ELECTRON_IS_DEV === '1';
let tray = null;
let win = null;

app.on('ready', () => {
  nativeTheme.themeSource = 'dark';

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
    },
  });

  win.loadFile('index.html');

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Hide instead of close
  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });

  // Hide when clicking outside (disabled in dev mode to keep DevTools usable)
  if (!isDev) {
    win.on('blur', () => {
      win.hide();
    });
  }

  // Toggle window on tray click
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      positionWindow();
      win.show();
    }
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

