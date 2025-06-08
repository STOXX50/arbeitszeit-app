# PWA Icons Information

Da die Icons für die PWA-Funktionalität benötigt werden, hier die erforderlichen Dateien:

## Benötigte Icon-Dateien (noch zu erstellen):
- `/public/icon-192.png` - 192x192px PNG Icon
- `/public/icon-512.png` - 512x512px PNG Icon  
- `/public/icon-maskable-192.png` - 192x192px Maskable Icon
- `/public/icon-maskable-512.png` - 512x512px Maskable Icon

## Generierung:
Diese können aus dem bestehenden `/public/favicon.svg` generiert werden:

1. SVG zu PNG konvertieren in verschiedenen Größen
2. Maskable Icons haben zusätzlichen Safe-Area Padding
3. Alle Icons sollten das Arbeitszeit-App Design verwenden

## Temporärer Fix:
Das bestehende `favicon.svg` wird als Fallback verwendet, bis die PNG-Icons erstellt sind.

## Tool-Empfehlungen:
- PWA Icon Generator: https://www.pwabuilder.com/imageGenerator
- Figma/Sketch für Icon-Design
- ImageMagick für Batch-Konvertierung

Die Icons sind für PWA-Tests erforderlich (PWA-010, PWA-011).