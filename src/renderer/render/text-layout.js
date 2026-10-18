import { Anchor } from '../model/text-layer.js';

export const LINE_HEIGHT = 1.1;

/**
 * Greedy word wrap. A single word wider than `maxWidth` stays on its own line.
 * @param {(text: string) => number} measure width of a string in canvas pixels
 */
export function wrapText(text, maxWidth, measure) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Y coordinate of the top of a text block whose `anchor` edge sits at `y`. */
export function blockTop(anchor, y, blockHeight) {
  switch (anchor) {
    case Anchor.TOP:
      return y;
    case Anchor.MIDDLE:
      return y - blockHeight / 2;
    case Anchor.BOTTOM:
      return y - blockHeight;
    default:
      throw new Error(`Unknown anchor "${anchor}"`);
  }
}
