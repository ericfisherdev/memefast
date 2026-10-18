import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Handle,
  MIN_CROP_SIZE,
  fitAspect,
  hitTestHandle,
  moveRect,
  resizeRect,
} from '../src/renderer/tools/crop-geometry.js';

const bounds = { w: 1000, h: 800 };
const rect = { x: 100, y: 100, w: 400, h: 300 };

test('hitTestHandle finds corners, edges, and the interior', () => {
  assert.equal(hitTestHandle(rect, { x: 100, y: 100 }, 8), Handle.NW);
  assert.equal(hitTestHandle(rect, { x: 500, y: 400 }, 8), Handle.SE);
  assert.equal(hitTestHandle(rect, { x: 300, y: 100 }, 8), Handle.N);
  assert.equal(hitTestHandle(rect, { x: 500, y: 250 }, 8), Handle.E);
  assert.equal(hitTestHandle(rect, { x: 300, y: 250 }, 8), Handle.MOVE);
  assert.equal(hitTestHandle(rect, { x: 900, y: 700 }, 8), null);
});

test('hitTestHandle ignores edges when only corners are allowed', () => {
  assert.equal(hitTestHandle(rect, { x: 300, y: 100 }, 8, true), Handle.MOVE);
});

test('moveRect clamps to bounds', () => {
  assert.deepEqual(moveRect(rect, -500, 900, bounds), { x: 0, y: 500, w: 400, h: 300 });
});

test('resizeRect keeps the opposite corner fixed', () => {
  assert.deepEqual(resizeRect(rect, Handle.SE, { x: 700, y: 600 }, bounds), {
    x: 100,
    y: 100,
    w: 600,
    h: 500,
  });
});

test('resizeRect clamps to bounds and minimum size', () => {
  const grown = resizeRect(rect, Handle.SE, { x: 5000, y: 5000 }, bounds);
  assert.equal(grown.x + grown.w, bounds.w);
  assert.equal(grown.y + grown.h, bounds.h);

  const shrunk = resizeRect(rect, Handle.NW, { x: 5000, y: 5000 }, bounds);
  assert.equal(shrunk.w, MIN_CROP_SIZE);
  assert.equal(shrunk.h, MIN_CROP_SIZE);
});

test('resizeRect preserves aspect ratio on corner drags', () => {
  const resized = resizeRect(rect, Handle.SE, { x: 700, y: 300 }, bounds, 1);
  assert.equal(resized.w, resized.h);
  assert.equal(resized.x, 100);
  assert.equal(resized.y, 100);
});

test('resizeRect anchors the far corner for a north-west aspect drag', () => {
  const resized = resizeRect(rect, Handle.NW, { x: 300, y: 50 }, bounds, 2);
  assert.equal(resized.x + resized.w, 500);
  assert.equal(resized.y + resized.h, 400);
  assert.equal(resized.w / resized.h, 2);
});

test('fitAspect centers the largest matching rect', () => {
  assert.deepEqual(fitAspect(rect, 1), { x: 150, y: 100, w: 300, h: 300 });
  assert.deepEqual(fitAspect(rect, null), rect);
});
