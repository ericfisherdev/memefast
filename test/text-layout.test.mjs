import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Anchor } from '../src/renderer/model/text-layer.js';
import { blockTop, wrapText } from '../src/renderer/render/text-layout.js';

const measure = (text) => text.length * 10;

test('wrapText keeps short text on one line', () => {
  assert.deepEqual(wrapText('hello world', 200, measure), ['hello world']);
});

test('wrapText breaks at word boundaries when a line would overflow', () => {
  assert.deepEqual(wrapText('one two three', 80, measure), ['one two', 'three']);
});

test('wrapText leaves an over-wide single word on its own line', () => {
  assert.deepEqual(wrapText('extraordinarily big', 50, measure), ['extraordinarily', 'big']);
});

test('wrapText honours explicit newlines', () => {
  assert.deepEqual(wrapText('a\nb', 500, measure), ['a', 'b']);
});

test('blockTop positions the block relative to its anchor', () => {
  assert.equal(blockTop(Anchor.TOP, 100, 40), 100);
  assert.equal(blockTop(Anchor.MIDDLE, 100, 40), 80);
  assert.equal(blockTop(Anchor.BOTTOM, 100, 40), 60);
});

test('blockTop rejects an unknown anchor', () => {
  assert.throws(() => blockTop('side', 0, 0), /Unknown anchor/);
});
