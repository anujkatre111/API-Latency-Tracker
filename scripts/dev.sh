#!/usr/bin/env bash
# Uses Node 22 via nvm (avoids Node 24 compatibility issues with Next.js)
unset npm_config_prefix 2>/dev/null
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 22 2>/dev/null || nvm use default
fi
exec npx next dev -p 3001
