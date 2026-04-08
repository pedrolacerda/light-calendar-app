#!/usr/bin/env bash
# Build script that works around iCloud Drive adding resource forks
# which break macOS codesign during electron-builder packaging.
#
# Copies source to a temp dir, builds there, copies artifacts back.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR=$(mktemp -d -t light-calendar-build)

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

# Build DMG if --dmg flag is passed
if [[ "${1:-}" == "--dmg" ]]; then
  echo "→ Creating DMG installer ..."
  hdiutil create \
    -volname "Light Calendar" \
    -srcfolder "dist/mac-arm64/Light Calendar.app" \
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
echo "   App bundle: dist/mac-arm64/Light Calendar.app"
