const { BrowserWindow, app, dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const SAVE_CHANNEL = 'image:save';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const FALLBACK_FILE_NAME = 'meme.png';

function toPngBuffer(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('Image data must be a byte array');
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('Image data is not a PNG');
  }
  return buffer;
}

function defaultSavePath(suggestedName) {
  const safeName = typeof suggestedName === 'string' ? path.basename(suggestedName) : '';
  return path.join(app.getPath('pictures'), safeName || FALLBACK_FILE_NAME);
}

/**
 * Resolves `{ saved: true, filePath }` after writing, or `{ saved: false }` when the
 * user cancels the dialog. Rejects when the bytes are not a PNG or the write fails.
 */
async function saveImage(event, bytes, suggestedName) {
  const png = toPngBuffer(bytes);
  const owner = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(owner, {
    defaultPath: defaultSavePath(suggestedName),
    filters: [{ name: 'PNG image', extensions: ['png'] }],
  });
  if (canceled || !filePath) return { saved: false };

  await fs.writeFile(filePath, png);
  return { saved: true, filePath };
}

function registerImageSaveHandler() {
  ipcMain.handle(SAVE_CHANNEL, saveImage);
}

module.exports = { registerImageSaveHandler };
