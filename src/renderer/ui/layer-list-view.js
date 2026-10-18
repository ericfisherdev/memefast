import { ChangeKind } from '../model/meme-model.js';

/** Text inputs for every layer, plus add/remove. Text edits never re-render the list. */
export class LayerListView {
  #model;
  #list;

  constructor({ model, list, addButton }) {
    this.#model = model;
    this.#list = list;

    list.addEventListener('input', (event) => {
      const id = this.#layerId(event.target);
      if (id) model.updateLayer(id, { text: event.target.value });
    });
    list.addEventListener('focusin', (event) => {
      const id = this.#layerId(event.target);
      if (id) model.selectLayer(id);
    });
    list.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-remove]');
      if (button) model.removeLayer(this.#layerId(button));
    });
    addButton.addEventListener('click', () => {
      const layer = model.addLayer();
      this.#inputFor(layer.id)?.focus();
    });

    model.subscribe((kind) => {
      if (kind === ChangeKind.LAYER_LIST) this.#render();
      if (kind === ChangeKind.LAYER_LIST || kind === ChangeKind.SELECTION) this.#markSelected();
    });
    this.#render();
  }

  #layerId(element) {
    return element.closest('li[data-id]')?.dataset.id ?? null;
  }

  #inputFor(id) {
    return this.#list.querySelector(`li[data-id="${id}"] textarea`);
  }

  #render() {
    this.#list.replaceChildren(...this.#model.layers.map((layer) => this.#createItem(layer)));
  }

  #createItem(layer) {
    const item = document.createElement('li');
    item.dataset.id = layer.id;

    const input = document.createElement('textarea');
    input.rows = 1;
    input.value = layer.text;
    input.placeholder = layer.label;
    input.setAttribute('aria-label', layer.label);
    input.spellcheck = false;
    item.append(input);

    if (layer.removable) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'icon-button';
      remove.dataset.remove = '';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Remove ${layer.label}`);
      item.append(remove);
    }
    return item;
  }

  #markSelected() {
    for (const item of this.#list.children) {
      item.classList.toggle('selected', item.dataset.id === this.#model.selectedId);
    }
  }
}
