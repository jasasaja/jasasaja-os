import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getNextTrapTarget } from './focusTrap.ts';

describe('getNextTrapTarget', () => {
  const container = { id: 'dialog' };
  const btnClose = { id: 'close' };
  const inputTitle = { id: 'title' };
  const btnSubmit = { id: 'submit' };

  it('wraps forward Tab from last focusable element back to first', () => {
    const items = [btnClose, inputTitle, btnSubmit];
    assert.equal(getNextTrapTarget(items, btnSubmit, false, container), btnClose);
  });

  it('wraps backward Shift+Tab from first focusable element to last', () => {
    const items = [btnClose, inputTitle, btnSubmit];
    assert.equal(getNextTrapTarget(items, btnClose, true, container), btnSubmit);
  });

  it('allows native traversal between interior focusable elements', () => {
    const items = [btnClose, inputTitle, btnSubmit];
    assert.equal(getNextTrapTarget(items, btnClose, false, container), null);
    assert.equal(getNextTrapTarget(items, inputTitle, false, container), null);
    assert.equal(getNextTrapTarget(items, inputTitle, true, container), null);
    assert.equal(getNextTrapTarget(items, btnSubmit, true, container), null);
  });

  it('pulls focus back into dialog when active element is outside or on container', () => {
    const items = [btnClose, inputTitle, btnSubmit];
    const outside = { id: 'outside-nav' };

    assert.equal(getNextTrapTarget(items, container, false, container), btnClose);
    assert.equal(getNextTrapTarget(items, container, true, container), btnSubmit);
    assert.equal(getNextTrapTarget(items, outside, false, container), btnClose);
    assert.equal(getNextTrapTarget(items, null, true, container), btnSubmit);
  });

  it('keeps focus clamped when zero or one focusable elements exist', () => {
    assert.equal(getNextTrapTarget([btnClose], btnClose, false, container), btnClose);
    assert.equal(getNextTrapTarget([btnClose], btnClose, true, container), btnClose);
    assert.equal(getNextTrapTarget([], container, false, container), container);
    assert.equal(getNextTrapTarget([], null, true, container), container);
  });
});
