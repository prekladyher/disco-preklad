#!/usr/bin/env bash

set -e

# Build translation files for Disco Translator
build_text() {
  mkdir -p target/text

  node scripts/l10n append -c source/l10n/cs/Dialogues/ > target/text/Dialogues.po
  node scripts/l10n append -c source/l10n/cs/General.po > target/text/General.po
  node scripts/l10n append -c source/l10n/cs/CollageMode.po > target/text/CollageMode.po
}

# Apply translations to `shadow/lockits/*.dat` assets
build_lockit() {
  mkdir -p target/assets

  for file in shadow/lockits/*.dat; do
    echo "Building lockit $(basename $file)..." >&2
    node scripts/build lockit "$file" "target/text/*.po" "target/assets/$(basename $file)"
  done
}

# Build additional localization assets
build_others() {
  mkdir -p target/assets

  node scripts/build others
}

# Build translations for dialogue database asset
build_dialogue() {
  mkdir -p target/assets

  find "shadow/assets/" -name "Disco Elysium-CAB-*.dat" | while read -d $'\n' file; do
    echo "Building dialogue database $(basename "$file")..." >&2
    node scripts/build dialogue "$file" "target/text/*.po" "target/assets/$(basename "$file")"
  done
}

# Copy localized textures to `shadow/images/`
build_images() {
  mkdir -p target/images

  # Copy original images
  cp shadow/images/*.png target/images/
  # Override localized images
  node scripts/build images
}

# Prepare game bundles
build_bundles() {
  mkdir -p target/package

  cp -r shadow/bundles/* target/package/
}


# Clean previous builds if requested
if [[ -v CLEAN ]]; then
  echo "Cleaning previous build..." >&2
  rm -rf build target/{text,assets,images}
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

# Build other assets
if [[ -v OTHERS ]]; then
  echo "Building additional localization assets..." >&2
  build_others
fi

# Build dialogue database asset
if [[ -v DIALOGUE ]]; then
  build_dialogue
fi

# Build image assets
if [[ -v IMAGES ]]; then
  echo "Copying image assets data..." >&2
  build_images
fi

# Prepare game bundles
if [[ -v BUNDLES ]]; then
  build_bundles
fi
