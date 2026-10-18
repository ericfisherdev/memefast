import { paintCropView } from '../render/crop-painter.js';
import { paintMeme } from '../render/meme-painter.js';
import { canvasPixelScale } from './canvas-coordinates.js';

const STAGE_PADDING_PX = 32;
const MAX_UPSCALE = 2;
const TEXT_HIT_PADDING_CSS_PX = 8;

/** Owns the visible canvas: sizing it to the stage and painting edit or crop views. */
export class Preview {
  #canvas;
  #stage;
  #emptyState;
  #ctx;
  #textBounds = [];

  /** @param onResize called when the stage size changes, so the owner can repaint */
  constructor({ canvas, stage, emptyState, onResize }) {
    this.#canvas = canvas;
    this.#stage = stage;
    this.#emptyState = emptyState;
    this.#ctx = canvas.getContext('2d');
    new ResizeObserver(() => {
      this.#fit();
      onResize();
    }).observe(stage);
  }

  get canvas() {
    return this.#canvas;
  }

  get pixelScale() {
    return canvasPixelScale(this.#canvas);
  }

  clear() {
    this.#textBounds = [];
    this.#canvas.hidden = true;
    this.#emptyState.hidden = false;
  }

  showEdit(scene) {
    this.#prepare(scene.crop.w, scene.crop.h);
    this.#textBounds = paintMeme(this.#ctx, scene);
  }

  showCrop(image, rect, { cornersOnly }) {
    this.#prepare(image.width, image.height);
    this.#textBounds = [];
    paintCropView(this.#ctx, image, rect, { pixelScale: this.pixelScale, cornersOnly });
  }

  /** @returns {string | null} id of the topmost text layer under `point` (canvas pixels) */
  hitTestText(point) {
    const padding = TEXT_HIT_PADDING_CSS_PX * this.pixelScale;
    const hit = [...this.#textBounds].reverse().find(
      (box) =>
        point.x >= box.x - padding &&
        point.x <= box.x + box.w + padding &&
        point.y >= box.y - padding &&
        point.y <= box.y + box.h + padding,
    );
    return hit?.id ?? null;
  }

  #prepare(width, height) {
    this.#emptyState.hidden = true;
    this.#canvas.hidden = false;
    if (this.#canvas.width !== width) this.#canvas.width = width;
    if (this.#canvas.height !== height) this.#canvas.height = height;
    this.#fit();
  }

  #fit() {
    const { width, height } = this.#canvas;
    if (!width || !height) return;
    const scale = Math.min(
      (this.#stage.clientWidth - STAGE_PADDING_PX) / width,
      (this.#stage.clientHeight - STAGE_PADDING_PX) / height,
      MAX_UPSCALE,
    );
    this.#canvas.style.width = `${Math.max(1, width * scale)}px`;
    this.#canvas.style.height = `${Math.max(1, height * scale)}px`;
  }
}
