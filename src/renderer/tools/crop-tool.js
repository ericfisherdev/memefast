import { canvasPixelScale, eventToCanvasPoint } from '../ui/canvas-coordinates.js';
import { Handle, fitAspect, hitTestHandle, moveRect, resizeRect, roundRect } from './crop-geometry.js';

const HIT_TOLERANCE_CSS_PX = 12;

const CURSORS = Object.freeze({
  [Handle.NW]: 'nwse-resize',
  [Handle.SE]: 'nwse-resize',
  [Handle.NE]: 'nesw-resize',
  [Handle.SW]: 'nesw-resize',
  [Handle.N]: 'ns-resize',
  [Handle.S]: 'ns-resize',
  [Handle.E]: 'ew-resize',
  [Handle.W]: 'ew-resize',
  [Handle.MOVE]: 'move',
});

/** Interactive crop rectangle over a canvas showing the full source image. */
export class CropTool {
  #canvas;
  #onChange;
  #rect = null;
  #bounds = null;
  #aspect = null;
  #abort = null;
  #drag = null;

  /** @param onChange called whenever the rectangle or active state changes */
  constructor({ canvas, onChange }) {
    this.#canvas = canvas;
    this.#onChange = onChange;
  }

  get active() {
    return this.#abort !== null;
  }

  get rect() {
    return this.#rect;
  }

  get cornersOnly() {
    return this.#aspect !== null;
  }

  /** Crop rectangle in source pixels, rounded to whole pixels. */
  get committedRect() {
    return roundRect(this.#rect);
  }

  activate(rect, bounds, aspect = null) {
    this.deactivate();
    this.#bounds = bounds;
    this.#aspect = aspect;
    this.#rect = fitAspect(rect, aspect);
    this.#abort = new AbortController();

    const options = { signal: this.#abort.signal };
    this.#canvas.addEventListener('pointerdown', this.#onPointerDown, options);
    this.#canvas.addEventListener('pointermove', this.#onPointerMove, options);
    this.#canvas.addEventListener('pointerup', this.#onPointerEnd, options);
    this.#canvas.addEventListener('pointercancel', this.#onPointerEnd, options);
    this.#onChange();
  }

  deactivate() {
    if (!this.active) return;
    this.#abort.abort();
    this.#abort = null;
    this.#drag = null;
    this.#canvas.style.cursor = '';
    this.#onChange();
  }

  setAspect(aspect) {
    this.#aspect = aspect;
    this.#rect = fitAspect(this.#rect, aspect);
    this.#onChange();
  }

  #hitTest(point) {
    const tolerance = HIT_TOLERANCE_CSS_PX * canvasPixelScale(this.#canvas);
    return hitTestHandle(this.#rect, point, tolerance, this.cornersOnly);
  }

  #onPointerDown = (event) => {
    const point = eventToCanvasPoint(event, this.#canvas);
    const handle = this.#hitTest(point);
    if (!handle) return;
    this.#drag = { handle, start: point, startRect: this.#rect };
    this.#canvas.setPointerCapture(event.pointerId);
  };

  #onPointerMove = (event) => {
    const point = eventToCanvasPoint(event, this.#canvas);
    if (!this.#drag) {
      this.#canvas.style.cursor = CURSORS[this.#hitTest(point)] ?? '';
      return;
    }
    const { handle, start, startRect } = this.#drag;
    this.#rect =
      handle === Handle.MOVE
        ? moveRect(startRect, point.x - start.x, point.y - start.y, this.#bounds)
        : resizeRect(startRect, handle, point, this.#bounds, this.#aspect);
    this.#onChange();
  };

  #onPointerEnd = () => {
    this.#drag = null;
  };
}
