import { handlePoints } from '../tools/crop-geometry.js';

const DIM_COLOR = 'rgba(0, 0, 0, 0.6)';
const GUIDE_COLOR = 'rgba(255, 255, 255, 0.35)';
const BORDER_COLOR = '#ffffff';
const HANDLE_SIZE_CSS_PX = 10;
const BORDER_WIDTH_CSS_PX = 2;

/**
 * Paints the full source image dimmed, with `rect` left bright. The canvas must already
 * match the image size. `pixelScale` is canvas pixels per CSS pixel, keeping strokes and
 * handles a constant on-screen size.
 */
export function paintCropView(ctx, image, rect, { pixelScale, cornersOnly }) {
  const { width, height } = image;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = DIM_COLOR;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);

  paintThirdsGuides(ctx, rect, pixelScale);
  paintBorder(ctx, rect, pixelScale);
  paintHandles(ctx, rect, pixelScale, cornersOnly);
}

function paintThirdsGuides(ctx, { x, y, w, h }, pixelScale) {
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = pixelScale;
  ctx.beginPath();
  for (const fraction of [1 / 3, 2 / 3]) {
    ctx.moveTo(x + w * fraction, y);
    ctx.lineTo(x + w * fraction, y + h);
    ctx.moveTo(x, y + h * fraction);
    ctx.lineTo(x + w, y + h * fraction);
  }
  ctx.stroke();
}

function paintBorder(ctx, { x, y, w, h }, pixelScale) {
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH_CSS_PX * pixelScale;
  ctx.strokeRect(x, y, w, h);
}

function paintHandles(ctx, rect, pixelScale, cornersOnly) {
  const size = HANDLE_SIZE_CSS_PX * pixelScale;
  ctx.fillStyle = BORDER_COLOR;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = pixelScale;
  for (const { x, y } of handlePoints(rect, cornersOnly)) {
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  }
}
