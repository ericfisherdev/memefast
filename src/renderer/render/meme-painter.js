import { LINE_HEIGHT, blockTop, wrapText } from './text-layout.js';

// Impact where installed; Anton (bundled, OFL) is the metric-similar fallback.
export const FONT_FAMILY = '"Impact", "Anton", sans-serif';

const MAX_LINE_WIDTH_RATIO = 0.94;
const STROKE_WIDTH_RATIO = 0.16;

/**
 * Paints the cropped image and text layers. The canvas must already be sized to `crop`.
 * @returns {{id: string, x: number, y: number, w: number, h: number}[]} text bounds in canvas pixels
 */
export function paintMeme(ctx, { image, crop, layers, uppercase }) {
  const { x, y, w, h } = crop;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

  const bounds = [];
  for (const layer of layers) {
    const box = paintTextLayer(ctx, layer, uppercase);
    if (box) bounds.push(box);
  }
  return bounds;
}

function paintTextLayer(ctx, layer, uppercase) {
  const trimmed = layer.text.trimEnd();
  if (!trimmed) return null;
  const text = uppercase ? trimmed.toUpperCase() : trimmed;

  const { width, height } = ctx.canvas;
  const fontPx = Math.round(layer.size * width);
  ctx.font = `${fontPx}px ${FONT_FAMILY}`;
  const measure = (line) => ctx.measureText(line).width;

  const lines = wrapText(text, width * MAX_LINE_WIDTH_RATIO, measure);
  const lineHeight = fontPx * LINE_HEIGHT;
  const blockHeight = lines.length * lineHeight;
  const top = blockTop(layer.anchor, layer.y * height, blockHeight);
  const centerX = layer.x * width;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = fontPx * STROKE_WIDTH_RATIO;
  ctx.strokeStyle = layer.stroke;
  ctx.fillStyle = layer.fill;

  const lineY = (index) => top + lineHeight * (index + 0.5);
  lines.forEach((line, i) => ctx.strokeText(line, centerX, lineY(i)));
  lines.forEach((line, i) => ctx.fillText(line, centerX, lineY(i)));

  const widest = Math.max(...lines.map(measure));
  return { id: layer.id, x: centerX - widest / 2, y: top, w: widest, h: blockHeight };
}
