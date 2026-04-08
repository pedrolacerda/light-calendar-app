# Light Calendar

A lightweight macOS menu bar calendar app built with Electron. Click the tray icon to view a clean, dark-themed calendar — one click away from any workflow.

![Light Calendar screenshot](image.png)

## Features

- **Menu bar native** — lives in the macOS tray, no Dock icon
- **Dark theme** — matches macOS dark mode aesthetics
- **Today at a glance** — current date highlighted with a blue circle, current week row subtly emphasized
- **Month navigation** — browse months with ‹ / › arrows
- **Quick return** — click the month/year header to jump back to today
- **Click to select** — tap any date to highlight it
- **Easy exit** — right-click the tray icon and choose **Quit Light Calendar**
- **Auto-refresh** — today's highlight updates automatically at midnight

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Install

```bash
npm install
bash scripts/install-hooks.sh
```

### Run

```bash
npm start
```

### Dev Mode

Opens DevTools and disables blur-to-dismiss so you can inspect the UI:

```bash
npm run dev
```

## Project Structure

```
light-calendar-app/
├── main.js          # Electron main process (tray + window)
├── index.html       # Calendar markup
├── renderer.js      # Calendar rendering logic
├── styles.css       # Dark theme styles
├── assets/
│   ├── icon.icns    # macOS app icon
│   ├── icon.png     # Source icon (1024×1024)
│   └── tray-icon*   # macOS Template tray icons (1x + 2x)
└── package.json
```

## Building for Distribution

Build the `.app` bundle and a distributable `.zip`:

```bash
npm run build
```

Output goes to `dist/`:
- `dist/mac-arm64/Light Calendar.app` — the standalone app
- `dist/Light Calendar-*-mac.zip` — zipped app for distribution

### Creating a DMG installer

```bash
npm run build:dmg
```

This builds the app and wraps it in a `.dmg` disk image at `dist/Light Calendar.dmg`.

### Installing the built app

1. Open the `.dmg` or unzip the `.zip`
2. Drag **Light Calendar.app** into `/Applications`
3. Launch it — the calendar icon appears in the menu bar
4. The app has `LSUIElement` set, so it never shows in the Dock

### CI / Releases

A GitHub Actions pipeline builds both **x64** and **arm64** installers automatically when you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates a GitHub Release with `.zip` and `.dmg` artifacts for both architectures.

## How It Works

The app uses Electron's native `Tray` API to place a calendar icon in the macOS menu bar. Left-clicking it toggles a frameless, transparent `BrowserWindow` positioned directly below the icon, and right-clicking opens a small menu with a **Quit** option. The calendar is rendered with vanilla JS — no framework needed for this scope.

## License

ISC
