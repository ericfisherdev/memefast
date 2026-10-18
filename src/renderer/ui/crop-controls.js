/** Crop buttons and aspect-ratio picker. Pure view: the owner supplies the behaviour. */
export class CropControls {
  #startButton;
  #resetButton;
  #cropActions;

  /**
   * @param onStart () => void
   * @param onApply () => void
   * @param onCancel () => void
   * @param onReset () => void
   * @param onAspectChange (aspect: number | null) => void
   */
  constructor({
    startButton,
    resetButton,
    cropActions,
    applyButton,
    cancelButton,
    aspectSelect,
    onStart,
    onApply,
    onCancel,
    onReset,
    onAspectChange,
  }) {
    this.#startButton = startButton;
    this.#resetButton = resetButton;
    this.#cropActions = cropActions;

    startButton.addEventListener('click', () => onStart(this.#aspectOf(aspectSelect)));
    applyButton.addEventListener('click', onApply);
    cancelButton.addEventListener('click', onCancel);
    resetButton.addEventListener('click', onReset);
    aspectSelect.addEventListener('change', () => onAspectChange(this.#aspectOf(aspectSelect)));
  }

  /** @param state {{hasImage: boolean, cropping: boolean, isCropped: boolean}} */
  render({ hasImage, cropping, isCropped }) {
    this.#startButton.disabled = !hasImage || cropping;
    this.#startButton.hidden = cropping;
    this.#cropActions.hidden = !cropping;
    this.#resetButton.hidden = cropping;
    this.#resetButton.disabled = !isCropped;
  }

  #aspectOf(select) {
    return select.value === '' ? null : Number(select.value);
  }
}
