import { ImageClipboard } from './io/image-clipboard.js';
import { ImageIntake } from './io/image-intake.js';
import { ImageSaver } from './io/image-saver.js';
import { renderMemePng } from './io/png-export.js';
import { MemeModel } from './model/meme-model.js';
import { CropTool } from './tools/crop-tool.js';
import { TextDragTool } from './tools/text-drag-tool.js';
import { CropControls } from './ui/crop-controls.js';
import { LayerListView } from './ui/layer-list-view.js';
import { Preview } from './ui/preview.js';
import { StatusBar } from './ui/status-bar.js';
import { StyleControls } from './ui/style-controls.js';

const byId = (id) => document.getElementById(id);

const model = new MemeModel();
const status = new StatusBar(byId('status'));
const imageSaver = new ImageSaver(window.memefast);
const imageClipboard = new ImageClipboard(navigator.clipboard);

const preview = new Preview({
  canvas: byId('canvas'),
  stage: byId('stage'),
  emptyState: byId('empty-state'),
  onResize: () => repaint(),
});

const cropTool = new CropTool({ canvas: preview.canvas, onChange: () => repaint() });

const textDragTool = new TextDragTool({
  canvas: preview.canvas,
  hitTest: (point) => preview.hitTestText(point),
  isEnabled: () => model.hasImage && !cropTool.active,
  onSelect: (id) => model.selectLayer(id),
  onDrag: (id, dx, dy) => model.nudgeLayer(id, dx, dy),
});
textDragTool.attach();

const cropControls = new CropControls({
  startButton: byId('crop-start'),
  resetButton: byId('crop-reset'),
  cropActions: byId('crop-actions'),
  applyButton: byId('crop-apply'),
  cancelButton: byId('crop-cancel'),
  aspectSelect: byId('crop-aspect'),
  onStart: startCrop,
  onApply: applyCrop,
  onCancel: () => cropTool.deactivate(),
  onReset: () => model.resetCrop(),
  onAspectChange: (aspect) => cropTool.active && cropTool.setAspect(aspect),
});

new LayerListView({ model, list: byId('layer-list'), addButton: byId('add-text') });
new StyleControls({
  model,
  heading: byId('style-heading'),
  size: byId('size'),
  fill: byId('fill'),
  stroke: byId('stroke'),
  resetPosition: byId('reset-position'),
  uppercase: byId('uppercase'),
});

const imageIntake = new ImageIntake({
  document,
  openButton: byId('open-image'),
  fileInput: byId('file-input'),
  onImage: openImage,
  onRejected: (message) => status.error(message),
});

const exportButtons = [byId('save'), byId('copy')];
byId('save').addEventListener('click', () => runExport(saveImage));
byId('copy').addEventListener('click', () => runExport(copyImage));
document.addEventListener('keydown', handleShortcut);

model.subscribe(() => repaint());
document.fonts.load('40px Anton').then(() => repaint());
repaint();

function repaint() {
  if (!model.hasImage) {
    preview.clear();
  } else if (cropTool.active) {
    preview.showCrop(model.image, cropTool.rect, { cornersOnly: cropTool.cornersOnly });
  } else {
    preview.showEdit(model);
  }
  cropControls.render({
    hasImage: model.hasImage,
    cropping: cropTool.active,
    isCropped: model.isCropped,
  });
  for (const button of exportButtons) button.disabled = !model.hasImage;
}

async function openImage(blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    cropTool.deactivate();
    model.setImage(bitmap);
  } catch {
    status.error('Could not read that image');
  }
}

function startCrop(aspect) {
  const { image, crop } = model;
  cropTool.activate(crop, { w: image.width, h: image.height }, aspect);
}

function applyCrop() {
  model.setCrop(cropTool.committedRect);
  cropTool.deactivate();
}

async function saveImage(png) {
  const { saved } = await imageSaver.save(png);
  if (saved) status.info('Saved');
}

async function copyImage(png) {
  await imageClipboard.copy(png);
  status.info('Copied to clipboard');
}

async function runExport(action) {
  if (!model.hasImage) return;
  try {
    await action(await renderMemePng(model));
  } catch (error) {
    status.error(`Export failed: ${error.message}`);
  }
}

function handleShortcut(event) {
  const withCommand = event.ctrlKey || event.metaKey;
  if (withCommand && event.key === 's') {
    event.preventDefault();
    runExport(saveImage);
  } else if (withCommand && event.key === 'o') {
    event.preventDefault();
    imageIntake.openPicker();
  } else if (cropTool.active && event.key === 'Enter' && !event.target.closest('button, select, textarea')) {
    applyCrop();
  } else if (cropTool.active && event.key === 'Escape') {
    cropTool.deactivate();
  }
}
