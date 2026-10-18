import { ChangeKind } from '../model/meme-model.js';

const PERCENT = 100;

/** Size, colour, and position controls for the selected text layer, plus the ALL CAPS toggle. */
export class StyleControls {
  #model;
  #heading;
  #size;
  #fill;
  #stroke;
  #fields;

  constructor({ model, heading, size, fill, stroke, resetPosition, uppercase }) {
    this.#model = model;
    this.#heading = heading;
    this.#size = size;
    this.#fill = fill;
    this.#stroke = stroke;
    this.#fields = [size, fill, stroke, resetPosition];

    size.addEventListener('input', () => this.#update({ size: size.valueAsNumber / PERCENT }));
    fill.addEventListener('input', () => this.#update({ fill: fill.value }));
    stroke.addEventListener('input', () => this.#update({ stroke: stroke.value }));
    resetPosition.addEventListener('click', () => {
      const layer = model.selectedLayer;
      if (layer) model.resetLayerPosition(layer.id);
    });
    uppercase.checked = model.uppercase;
    uppercase.addEventListener('change', () => model.setUppercase(uppercase.checked));

    model.subscribe((kind) => {
      if (kind === ChangeKind.LAYER_LIST || kind === ChangeKind.SELECTION) this.#sync();
    });
    this.#sync();
  }

  #update(patch) {
    const layer = this.#model.selectedLayer;
    if (layer) this.#model.updateLayer(layer.id, patch);
  }

  #sync() {
    const layer = this.#model.selectedLayer;
    for (const field of this.#fields) field.disabled = layer === null;
    this.#heading.textContent = layer ? `Style: ${layer.label}` : 'Style';
    if (!layer) return;
    this.#size.value = String(layer.size * PERCENT);
    this.#fill.value = layer.fill;
    this.#stroke.value = layer.stroke;
  }
}
