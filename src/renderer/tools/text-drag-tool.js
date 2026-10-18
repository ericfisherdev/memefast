import { eventToCanvasPoint } from '../ui/canvas-coordinates.js';

/** Click selects a text layer on the canvas; dragging moves it. */
export class TextDragTool {
  #canvas;
  #hitTest;
  #isEnabled;
  #onSelect;
  #onDrag;
  #drag = null;

  /**
   * @param hitTest (canvasPoint) => layer id or null
   * @param isEnabled () => boolean; lets other tools own the canvas
   * @param onSelect (id) => void
   * @param onDrag (id, dx, dy) => void, deltas as fractions of canvas size
   */
  constructor({ canvas, hitTest, isEnabled, onSelect, onDrag }) {
    this.#canvas = canvas;
    this.#hitTest = hitTest;
    this.#isEnabled = isEnabled;
    this.#onSelect = onSelect;
    this.#onDrag = onDrag;
  }

  attach() {
    this.#canvas.addEventListener('pointerdown', this.#onPointerDown);
    this.#canvas.addEventListener('pointermove', this.#onPointerMove);
    this.#canvas.addEventListener('pointerup', this.#onPointerEnd);
    this.#canvas.addEventListener('pointercancel', this.#onPointerEnd);
  }

  #onPointerDown = (event) => {
    if (!this.#isEnabled()) return;
    const point = eventToCanvasPoint(event, this.#canvas);
    const id = this.#hitTest(point);
    if (!id) return;
    this.#drag = { id, last: point };
    this.#canvas.setPointerCapture(event.pointerId);
    this.#onSelect(id);
  };

  #onPointerMove = (event) => {
    if (!this.#isEnabled()) return;
    const point = eventToCanvasPoint(event, this.#canvas);
    if (!this.#drag) {
      this.#canvas.style.cursor = this.#hitTest(point) ? 'move' : '';
      return;
    }
    const { id, last } = this.#drag;
    this.#drag.last = point;
    this.#onDrag(id, (point.x - last.x) / this.#canvas.width, (point.y - last.y) / this.#canvas.height);
  };

  #onPointerEnd = () => {
    this.#drag = null;
  };
}
