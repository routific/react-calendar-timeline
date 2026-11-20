import React from 'react';
import moment from 'moment';
import { render, act } from '@testing-library/react';
import interact from 'interactjs';
import Timeline from 'lib/Timeline';
import {
  LINE_HEIGHT,
  DAY_START,
  HOUR,
  makeGroups,
  makeItems,
  mockLayout,
  itemElement,
} from 'test-utility/timelineFixtures';

jest.mock('interactjs', () => require('test-utility/interactMock').createInteractMock());

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));
const fire = (el, type, event) => act(() => interact.fire(el, type, event));
const dropzone = groupId => ({ target: { dataset: { groupid: groupId } } });

function renderTimeline(props) {
  const container = document.body.appendChild(document.createElement('div'));
  const groups = makeGroups(5);
  const items = makeItems(groups);
  const allProps = {
    groups,
    items,
    lineHeight: LINE_HEIGHT,
    defaultTimeStart: moment(DAY_START + 6 * HOUR),
    defaultTimeEnd: moment(DAY_START + 18 * HOUR),
    ...props,
  };
  const utils = render(<Timeline {...allProps} />, { container });
  return {
    ...utils,
    items,
    rerender: nextProps => utils.rerender(<Timeline {...allProps} {...nextProps} />),
  };
}

describe('item interactables', () => {
  let layout;

  beforeEach(() => {
    layout = mockLayout();
  });

  afterEach(() => {
    interact.reset();
    layout.restore();
    document.body.innerHTML = '';
  });

  it('releases a selected item interactable when the item unmounts', () => {
    const { container, rerender, items } = renderTimeline({ selected: ['i0'] });
    const el = itemElement(container, 'Item 0');
    expect(interact.live.has(el)).toBe(true);

    rerender({ items: items.filter(item => item.id !== 'i0') });

    expect(interact.live.has(el)).toBe(false);
  });

  it('keeps the interactable of an item that unmounts mid-drag until the drag ends', async () => {
    const onItemMove = jest.fn();
    const { container } = renderTimeline({ selected: ['i0'], onItemMove });
    const el = itemElement(container, 'Item 0');

    fire(el, 'dragstart');
    // Drag moves need a pointer offset: a move to the item's own start time is ignored.
    fire(el, 'dragmove', { pageX: 100, dropzone: dropzone('g3') });
    // The dragged item is now drawn in row g3; its original element is gone.
    expect(el.isConnected).toBe(false);
    expect(interact.live.has(el)).toBe(true);

    fire(el, 'dragend', { dropzone: dropzone('g3') });
    await nextTick();

    expect(onItemMove).toHaveBeenCalledWith('i0', expect.any(Number), 'g3');
    expect(interact.live.has(el)).toBe(false);
  });
});
