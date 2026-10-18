const isImage = (file) => file?.type.startsWith('image/') ?? false;

/** Collects images from the file picker, drag-and-drop, and clipboard paste. */
export class ImageIntake {
  #fileInput;
  #onImage;
  #onRejected;

  /**
   * @param onImage (file: Blob) => void
   * @param onRejected (message: string) => void
   */
  constructor({ document, openButton, fileInput, onImage, onRejected }) {
    this.#fileInput = fileInput;
    this.#onImage = onImage;
    this.#onRejected = onRejected;

    openButton.addEventListener('click', () => this.openPicker());
    fileInput.addEventListener('change', () => {
      this.#accept(fileInput.files[0]);
      fileInput.value = '';
    });
    document.addEventListener('dragover', (event) => event.preventDefault());
    document.addEventListener('drop', (event) => {
      event.preventDefault();
      this.#accept(event.dataTransfer.files[0]);
    });
    document.addEventListener('paste', (event) => {
      const file = [...event.clipboardData.files].find(isImage);
      if (file) this.#accept(file);
    });
  }

  openPicker() {
    this.#fileInput.click();
  }

  #accept(file) {
    if (!file) return;
    if (isImage(file)) this.#onImage(file);
    else this.#onRejected('That file is not an image');
  }
}
