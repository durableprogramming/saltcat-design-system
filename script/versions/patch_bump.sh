#!/bin/bash

# patch_bump.sh - Increment the patch version in package.json
# Usage: ./script/versions/patch_bump.sh

set -e

PACKAGE_JSON="package.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

if [ ! -f "$PACKAGE_JSON" ]; then
    echo "Error: $PACKAGE_JSON not found in $PROJECT_ROOT"
    exit 1
fi

# Extract current version
current_version=$(node -p "require('./$PACKAGE_JSON').version")

if [ -z "$current_version" ]; then
    echo "Error: Could not read version from $PACKAGE_JSON"
    exit 1
fi

echo "Current version: $current_version"

# Parse version components (major.minor.patch)
IFS='.' read -r major minor patch <<< "$current_version"

# Increment patch version
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"

echo "New version: $new_version"

# Update package.json using node
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
pkg.version = '$new_version';
fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 2) + '\n');
"

echo "Successfully bumped patch version from $current_version to $new_version"