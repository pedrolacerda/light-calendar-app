#!/usr/bin/env bash
# Install git hooks for local development

HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/usr/bin/env bash
# post-commit hook: rebuild the app in the background after every commit

echo "🔨 Rebuilding Light Calendar in the background..."
nohup bash scripts/build.sh > /tmp/light-calendar-build.log 2>&1 &
echo "   Build running (PID $!) — check /tmp/light-calendar-build.log for output"
EOF

chmod +x "$HOOKS_DIR/post-commit"
echo "✅ Git hooks installed"
