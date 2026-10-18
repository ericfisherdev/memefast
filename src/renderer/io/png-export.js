import { paintMeme } from '../render/meme-painter.js';

/** Renders the meme at the cropped image's native resolution. */
export function renderMemePng(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = scene.crop.w;
  canvas.height = scene.crop.h;
  paintMeme(canvas.getContext('2d'), scene);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))),
      'image/png',
    );
  });
}
