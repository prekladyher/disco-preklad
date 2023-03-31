#!/bin/bash

set -e

# Build translation files for Disco Translator
build_text() {
  mkdir -p target/text

  node scripts/l10n append -c source/l10n/cs/Dialogues/ > target/text/Dialogues.po
  node scripts/l10n append -c source/l10n/cs/General.po > target/text/General.po
}

# Apply translations to `shadow/lockit/*.dat` assets
build_lockit() {
  mkdir -p target/lockit

  for file in shadow/lockit/*.dat; do
    local json="target/lockit/$(basename $file).json"

    echo "Building lockit $(basename $file)..." >&2
    # Convert asset file to JSON model
    node scripts/game read -j LanguageSourceAsset "$file" > "$json"
    # Merge translation to JSON file
    node scripts/build lockit "$json" "target/text/*.po"
    # Convert JSON back to asset file
    node scripts/game write -o "target/lockit/$(basename $file)" LanguageSourceAsset "$json"
  done
}

# Clean previous builds if requested
if [[ -v CLEAN ]]; then
  echo "Cleaning previous build..." >&2
  rm -rf build target/{text,lockit}
fi

# Combine translation files (default)
if [[ ! -v NOTEXT ]]; then
  echo "Combining translation files..." >&2
  build_text
fi

# Build lockit assets
if [[ -v LOCKIT ]]; then
  build_lockit
fi
