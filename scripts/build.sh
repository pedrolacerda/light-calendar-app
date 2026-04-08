#!/usr/bin/env bash
# Build script that works around iCloud Drive adding resource forks
# which break macOS codesign during electron-builder packaging.
#
# Copies source to a temp dir, builds there, copies artifacts back.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR=$(mktemp -d -t light-calendar-build)
APP_NAME="Light Calendar.app"

cleanup() {
  rm -rf "$BUILD_DIR"
}
trap cleanup EXIT

echo "→ Copying source to $BUILD_DIR ..."
for f in main.js index.html renderer.js styles.css package.json package-lock.json; do
  cp "$PROJECT_DIR/$f" "$BUILD_DIR/"
done
cp -R "$PROJECT_DIR/assets" "$BUILD_DIR/assets"

# Strip any extended attributes iCloud may have added
xattr -cr "$BUILD_DIR"

echo "→ Installing dependencies ..."
cd "$BUILD_DIR"
npm ci --quiet 2>&1

echo "→ Building with electron-builder ..."
unset ELECTRON_RUN_AS_NODE 2>/dev/null || true
npx electron-builder --mac

APP_BUNDLE_REL=$(find dist -maxdepth 2 -type d -name "$APP_NAME" -print -quit)
if [[ -z "$APP_BUNDLE_REL" ]]; then
  echo "Built app bundle not found in dist/" >&2
  exit 1
fi

# Build DMG if --dmg flag is passed
if [[ "${1:-}" == "--dmg" ]]; then
  echo "→ Creating DMG installer ..."
  hdiutil create \
    -volname "Light Calendar" \
    -srcfolder "$APP_BUNDLE_REL" \
    -ov -format UDZO \
    "dist/Light Calendar.dmg"
fi

echo "→ Copying artifacts back ..."
rm -rf "$PROJECT_DIR/dist"
cp -R "$BUILD_DIR/dist" "$PROJECT_DIR/dist"

echo ""
echo "✅ Build complete! Artifacts in dist/:"
ls -lh "$PROJECT_DIR/dist/"*.zip "$PROJECT_DIR/dist/"*.dmg 2>/dev/null || true
echo ""
APP_BUNDLE_PATH=$(find "$PROJECT_DIR/dist" -maxdepth 2 -type d -name "$APP_NAME" -print -quit)
if [[ -z "$APP_BUNDLE_PATH" ]]; then
  echo "Copied app bundle not found in $PROJECT_DIR/dist" >&2
  exit 1
fi

echo "   App bundle: ${APP_BUNDLE_PATH#$PROJECT_DIR/}"
