#!/usr/bin/env bash
set -euo pipefail

DEST_DIR="/Volumes/Transcend/gDrive/Documents/projects/FluencyPal/Code Backups"
DATE=$(date +"%Y-%m-%d")
ARCHIVE_NAME="${DATE}_fluencypal_code_backup.zip"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$DEST_DIR" ]; then
  echo "Error: destination directory does not exist: $DEST_DIR"
  exit 1
fi

echo "Creating backup: $ARCHIVE_NAME"
zip -r "$DEST_DIR/$ARCHIVE_NAME" "$ROOT_DIR/.git"
echo "Done: $DEST_DIR/$ARCHIVE_NAME"
