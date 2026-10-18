import { createBottomLayer, createFreeLayer, createTopLayer } from './text-layer.js';

export const ChangeKind = Object.freeze({
  IMAGE: 'image',
  CROP: 'crop',
  LAYER_LIST: 'layer-list',
  LAYER_CONTENT: 'layer-content',
  SELECTION: 'selection',
});

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const fullRect = (image) => ({ x: 0, y: 0, w: image.width, h: image.height });

export class MemeModel {
  #listeners = new Set();
  #freeLayerCount = 0;

  /** @type {ImageBitmap | null} */
  image = null;
  /** Crop rectangle in source-image pixels. */
  crop = null;
  uppercase = true;
  layers = [createTopLayer(), createBottomLayer()];
  selectedId = 'top';

  /** @returns {() => void} unsubscribe */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  get hasImage() {
    return this.image !== null;
  }

  get selectedLayer() {
    return this.layers.find((layer) => layer.id === this.selectedId) ?? null;
  }

  get isCropped() {
    if (!this.image) return false;
    const full = fullRect(this.image);
    return Object.keys(full).some((key) => full[key] !== this.crop[key]);
  }

  setImage(bitmap) {
    this.image?.close();
    this.image = bitmap;
    this.crop = fullRect(bitmap);
    this.#emit(ChangeKind.IMAGE);
  }

  setCrop(rect) {
    this.crop = { ...rect };
    this.#emit(ChangeKind.CROP);
  }

  resetCrop() {
    if (this.image) this.setCrop(fullRect(this.image));
  }

  setUppercase(enabled) {
    this.uppercase = enabled;
    this.#emit(ChangeKind.LAYER_CONTENT);
  }

  addLayer() {
    this.#freeLayerCount += 1;
    const layer = createFreeLayer(`free-${this.#freeLayerCount}`, `Text ${this.#freeLayerCount}`);
    this.layers = [...this.layers, layer];
    this.selectedId = layer.id;
    this.#emit(ChangeKind.LAYER_LIST);
    return layer;
  }

  removeLayer(id) {
    const layer = this.#find(id);
    if (!layer.removable) throw new Error(`Layer "${id}" cannot be removed`);
    this.layers = this.layers.filter((candidate) => candidate.id !== id);
    if (this.selectedId === id) this.selectedId = this.layers[0]?.id ?? null;
    this.#emit(ChangeKind.LAYER_LIST);
  }

  selectLayer(id) {
    if (this.selectedId === id) return;
    this.#find(id);
    this.selectedId = id;
    this.#emit(ChangeKind.SELECTION);
  }

  updateLayer(id, patch) {
    Object.assign(this.#find(id), patch);
    this.#emit(ChangeKind.LAYER_CONTENT);
  }

  /** Moves a layer by a fraction of the cropped image size. */
  nudgeLayer(id, dx, dy) {
    const layer = this.#find(id);
    layer.x = clamp01(layer.x + dx);
    layer.y = clamp01(layer.y + dy);
    this.#emit(ChangeKind.LAYER_CONTENT);
  }

  resetLayerPosition(id) {
    const layer = this.#find(id);
    layer.x = layer.home.x;
    layer.y = layer.home.y;
    this.#emit(ChangeKind.LAYER_CONTENT);
  }

  #find(id) {
    const layer = this.layers.find((candidate) => candidate.id === id);
    if (!layer) throw new Error(`Unknown layer "${id}"`);
    return layer;
  }

  #emit(kind) {
    for (const listener of this.#listeners) listener(kind);
  }
}
