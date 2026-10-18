export class ImageClipboard {
  #clipboard;

  /** @param clipboard {Clipboard} async clipboard API */
  constructor(clipboard) {
    this.#clipboard = clipboard;
  }

  copy(pngBlob) {
    return this.#clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
  }
}
