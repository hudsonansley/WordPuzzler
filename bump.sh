#!/bin/bash

JS_FILE="src/version.js"

# 1. Extract the current version string using grep and awk/sed
# Assumes the version is in a line like: const version = "1.2.3";
current_version=$(grep 'export const VERSION = ' "$JS_FILE" | awk -F'"' '{print $2}')
# 2. Split the version into major, minor, and patch components
IFS='.' read -r major minor patch <<< "$current_version"

if [[ $1 == 'minor' ]]; then
  ((minor++))
  patch=0
elif [[ $1 == 'major' ]]; then
  ((major++))
  minor=0
  patch=0
else
  ((patch++))
fi

# 5. Assemble the new version string
new_version="$major.$minor.$patch"

echo "export const VERSION = \"$new_version\";" > "$JS_FILE"

echo "Updated $JS_FILE from $current_version to $new_version"
