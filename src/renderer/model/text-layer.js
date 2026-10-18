export const Anchor = Object.freeze({
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom',
});

/** Font size as a fraction of image width. */
export const DEFAULT_SIZE = 0.1;
export const DEFAULT_FILL = '#ffffff';
export const DEFAULT_STROKE = '#000000';

const EDGE_MARGIN = 0.03;

function createLayer({ id, label, anchor, x, y, removable }) {
  return {
    id,
    label,
    text: '',
    anchor,
    x,
    y,
    home: { x, y },
    size: DEFAULT_SIZE,
    fill: DEFAULT_FILL,
    stroke: DEFAULT_STROKE,
    removable,
  };
}

export function createTopLayer() {
  return createLayer({
    id: 'top',
    label: 'Top text',
    anchor: Anchor.TOP,
    x: 0.5,
    y: EDGE_MARGIN,
    removable: false,
  });
}

export function createBottomLayer() {
  return createLayer({
    id: 'bottom',
    label: 'Bottom text',
    anchor: Anchor.BOTTOM,
    x: 0.5,
    y: 1 - EDGE_MARGIN,
    removable: false,
  });
}

export function createFreeLayer(id, label) {
  return createLayer({ id, label, anchor: Anchor.MIDDLE, x: 0.5, y: 0.5, removable: true });
}
