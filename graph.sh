#!/bin/bash
#
# Pomocny skript pro ziskani statistik prekladu z historie git repozitare.
#

trap abort INT
function abort() {
  echo "Aborted..." >&2
  exit 1
}

SINCE_COMMIT=$1
[ -z "$SINCE_COMMIT" ] && SINCE_COMMIT=a9ab39f

SOURCE_PATH=source/l10n/cs
TARGET_PATH=target/graph

mkdir -p "$TARGET_PATH"

git log --reverse --date=short --pretty=format:"%ad%x09%h%x09%s" "$SINCE_COMMIT"..HEAD -- "$SOURCE_PATH" > "$TARGET_PATH"/commits.txt

while IFS=$'\t' read -r -a line; do
  while git checkout ${line[1]} -- "$SOURCE_PATH" 2> /dev/null; [ $? -ne 0 ]; do
    echo "Waiting foor index.lock release" >&2
    sleep 1
  done
  stats=$(node scripts/l10n.js stats -s "$SOURCE_PATH" 2> /dev/null | grep -oP '(sourceCount|targetCount): [0-9]+')
  if [ $? -ne 0 ]; then
    echo "Skipping invalid commit ${line[1]}" >&2
    continue
  fi
  echo "Processing commit ${line[1]}" >&2
  source=$(echo "$stats" | grep -oP 'sourceCount: [0-9]*' | sed 's/[^0-9]//g')
  target=$(echo "$stats" | grep -oP 'targetCount: [0-9]*' | sed 's/[^0-9]//g')
  echo -e "${line[0]}\t${line[1]}\t$source\t$target\t${line[2]}" >> "$TARGET_PATH/points.tsv"
done < "target/graph/commits.txt"

git checkout HEAD -- "$SOURCE_PATH"
