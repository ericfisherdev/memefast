const VISIBLE_MS = 3000;

export class StatusBar {
  #element;
  #timer = null;

  constructor(element) {
    this.#element = element;
  }

  info(message) {
    this.#show(message, false);
  }

  error(message) {
    this.#show(message, true);
  }

  #show(message, isError) {
    clearTimeout(this.#timer);
    this.#element.textContent = message;
    this.#element.classList.toggle('error', isError);
    this.#element.classList.add('visible');
    this.#timer = setTimeout(() => this.#element.classList.remove('visible'), VISIBLE_MS);
  }
}
