#!/bin/bash
#
# Initialize new language from template files.
#

target_language=$1
source_language=$2

if [ ${#target_language} != 2 ]; then
  echo "Invalid or missing language code" >&2
  exit 1
fi

find source/l10n/en -name "*.pot" | while read source_file; do
  target_file=${source_file/\/en\//\/$target_language\/}
  target_file=${target_file/\.pot/\.po}
  target_path=$(dirname "$target_file")
  # Create empty file
  mkdir -p "$target_path"
  cp "$source_file" "$target_file"
  # Merge existing translation
  source_file=${target_file/\/$target_language\//\/$source_language\/}
  node scripts/l10n.js merge -h "$source_file" "$target_file"
done
