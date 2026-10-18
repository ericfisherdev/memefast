const DEFAULT_FILE_NAME = 'meme.png';

/** Hands PNG bytes to the main process, which owns the save dialog and the file write. */
export class ImageSaver {
  #bridge;

  /** @param bridge {{saveImage(bytes: Uint8Array, name: string): Promise<{saved: boolean, filePath?: string}>}} */
  constructor(bridge) {
    this.#bridge = bridge;
  }

  /** @returns {Promise<{saved: boolean, filePath?: string}>} saved is false when the user cancels */
  async save(pngBlob) {
    const bytes = new Uint8Array(await pngBlob.arrayBuffer());
    return this.#bridge.saveImage(bytes, DEFAULT_FILE_NAME);
  }
}
