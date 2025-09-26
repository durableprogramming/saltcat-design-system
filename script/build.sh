#!/bin/bash

# Clean previous builds
rm -rf dist

# Create dist directory
mkdir -p dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build ES modules
npx esbuild src/index.js --bundle --format=esm --outfile=dist/saltcat-design-system.esm.js

# Build minified versions
npx esbuild src/index.js --bundle --format=esm --minify --outfile=dist/saltcat-design-system.esm.min.js

# Copy source files for development
cp -r src dist/

echo "Build complete!"