#!/bin/bash
# Generate app icons from icon.svg
# Requires: ImageMagick (convert) or librsvg (rsvg-convert)
# Usage: ./scripts/generate-icons.sh

set -e

SIZES="20 29 40 58 60 76 80 87 120 152 167 180 192 512 1024"
SVG="public/icon.svg"
OUT="public"

for size in $SIZES; do
  echo "Generating ${size}x${size}..."
  if command -v rsvg-convert &> /dev/null; then
    rsvg-convert -w "$size" -h "$size" "$SVG" > "$OUT/icon-${size}.png"
  elif command -v convert &> /dev/null; then
    convert -background none -resize "${size}x${size}" "$SVG" "$OUT/icon-${size}.png"
  else
    echo "Error: Install ImageMagick or librsvg to generate icons"
    exit 1
  fi
done

# Create apple-touch-icon
cp "$OUT/icon-180.png" "$OUT/apple-touch-icon.png"

echo "Done! Icons generated in $OUT/"
