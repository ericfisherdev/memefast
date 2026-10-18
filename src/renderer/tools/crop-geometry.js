export const Handle = Object.freeze({
  NW: 'nw',
  N: 'n',
  NE: 'ne',
  E: 'e',
  SE: 'se',
  S: 's',
  SW: 'sw',
  W: 'w',
  MOVE: 'move',
});

export const MIN_CROP_SIZE = 16;

const CORNERS = [Handle.NW, Handle.NE, Handle.SE, Handle.SW];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Positions of the visible resize handles, in the rect's coordinate space. */
export function handlePoints({ x, y, w, h }, cornersOnly = false) {
  const midX = x + w / 2;
  const midY = y + h / 2;
  const points = [
    { handle: Handle.NW, x, y },
    { handle: Handle.N, x: midX, y },
    { handle: Handle.NE, x: x + w, y },
    { handle: Handle.E, x: x + w, y: midY },
    { handle: Handle.SE, x: x + w, y: y + h },
    { handle: Handle.S, x: midX, y: y + h },
    { handle: Handle.SW, x, y: y + h },
    { handle: Handle.W, x, y: midY },
  ];
  return cornersOnly ? points.filter((point) => CORNERS.includes(point.handle)) : points;
}

/** @returns {string | null} the handle under `point`, or null when outside the rect. */
export function hitTestHandle(rect, point, tolerance, cornersOnly = false) {
  const { x, y, w, h } = rect;
  const nearLeft = Math.abs(point.x - x) <= tolerance;
  const nearRight = Math.abs(point.x - (x + w)) <= tolerance;
  const nearTop = Math.abs(point.y - y) <= tolerance;
  const nearBottom = Math.abs(point.y - (y + h)) <= tolerance;
  const withinX = point.x >= x - tolerance && point.x <= x + w + tolerance;
  const withinY = point.y >= y - tolerance && point.y <= y + h + tolerance;

  const corner =
    (nearTop && nearLeft && Handle.NW) ||
    (nearTop && nearRight && Handle.NE) ||
    (nearBottom && nearRight && Handle.SE) ||
    (nearBottom && nearLeft && Handle.SW);
  if (corner) return corner;

  if (!cornersOnly) {
    const edge =
      (nearTop && withinX && Handle.N) ||
      (nearBottom && withinX && Handle.S) ||
      (nearLeft && withinY && Handle.W) ||
      (nearRight && withinY && Handle.E);
    if (edge) return edge;
  }

  const inside = point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
  return inside ? Handle.MOVE : null;
}

export function moveRect(rect, dx, dy, bounds) {
  return {
    ...rect,
    x: clamp(rect.x + dx, 0, bounds.w - rect.w),
    y: clamp(rect.y + dy, 0, bounds.h - rect.h),
  };
}

/**
 * Drags `handle` to `point`, keeping the opposite edges fixed and the result inside `bounds`.
 * @param {number | null} aspect width / height to preserve; only corner handles honour it
 */
export function resizeRect(rect, handle, point, bounds, aspect = null) {
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.w;
  let bottom = rect.y + rect.h;

  if (handle.includes('w')) left = clamp(point.x, 0, right - MIN_CROP_SIZE);
  if (handle.includes('e')) right = clamp(point.x, left + MIN_CROP_SIZE, bounds.w);
  if (handle.includes('n')) top = clamp(point.y, 0, bottom - MIN_CROP_SIZE);
  if (handle.includes('s')) bottom = clamp(point.y, top + MIN_CROP_SIZE, bounds.h);

  if (aspect !== null && CORNERS.includes(handle)) {
    const width = Math.min(right - left, (bottom - top) * aspect);
    const height = width / aspect;
    if (handle.includes('w')) left = right - width;
    else right = left + width;
    if (handle.includes('n')) top = bottom - height;
    else bottom = top + height;
  }

  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** Largest rect of the given aspect (width / height) centered inside `rect`. */
export function fitAspect(rect, aspect) {
  if (aspect === null) return { ...rect };
  const width = Math.min(rect.w, rect.h * aspect);
  const height = width / aspect;
  return {
    x: rect.x + (rect.w - width) / 2,
    y: rect.y + (rect.h - height) / 2,
    w: width,
    h: height,
  };
}

export function roundRect({ x, y, w, h }) {
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}
