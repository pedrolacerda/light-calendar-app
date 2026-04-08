#!/usr/bin/env bash
# Install git hooks for local development

set -euo pipefail

PROJECT_DIR="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$PROJECT_DIR/.git/hooks"

cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/usr/bin/env bash
# post-commit hook: rebuild the app and refresh /Applications after every commit

set -euo pipefail

PROJECT_DIR="$(git rev-parse --show-toplevel)"
LOG_FILE="/tmp/light-calendar-build.log"
APP_NAME="Light Calendar.app"
APP_TARGET="/Applications/$APP_NAME"

echo "🔨 Rebuilding Light Calendar and updating /Applications in the background..."
nohup bash -c '
  set -euo pipefail

  PROJECT_DIR="$1"
  APP_NAME="$2"
  APP_TARGET="$3"

  bash "$PROJECT_DIR/scripts/build.sh"

  APP_SOURCE=$(find "$PROJECT_DIR/dist" -maxdepth 2 -type d -name "$APP_NAME" -print -quit)
  if [[ -z "$APP_SOURCE" ]]; then
    echo "Built app not found in $PROJECT_DIR/dist" >&2
    exit 1
  fi

  rm -rf "$APP_TARGET"
  ditto "$APP_SOURCE" "$APP_TARGET"

  echo ""
  echo "✅ Updated $APP_TARGET"
' bash "$PROJECT_DIR" "$APP_NAME" "$APP_TARGET" > "$LOG_FILE" 2>&1 < /dev/null &
echo "   Build running (PID $!) — check $LOG_FILE for output"
EOF

chmod +x "$HOOKS_DIR/post-commit"
echo "✅ Git hooks installed"
