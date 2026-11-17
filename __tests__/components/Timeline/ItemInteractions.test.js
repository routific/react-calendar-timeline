import React from 'react';
import moment from 'moment';
import { render, fireEvent, act } from '@testing-library/react';
import interact from 'interactjs';
import Timeline from 'lib/Timeline';
import {
  LINE_HEIGHT,
  DAY_START,
  HOUR,
  makeGroups,
  makeItems,
  mockLayout,
  renderScrollingTimeline,
  renderedGroupIds,
  itemElement,
} from 'test-utility/rowWindowingHarness';

jest.mock('interactjs', () => require('test-utility/interactMock').createInteractMock());

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));
const liveItemElements = () => Array.from(interact.live).filter(el => el.classList.contains('rct-item'));
const rowOf = el => el.closest('[data-testid="groupRow"]').dataset.groupid;
const fire = (el, type, event) => act(() => interact.fire(el, type, event));
// Drag moves need a pointer offset: a move to the item's own start time is ignored.
const dropzone = groupId => ({ target: { dataset: { groupid: groupId } } });

describe('item interactions', () => {
  let layout;

  beforeEach(() => {
    layout = mockLayout();
  });

  afterEach(() => {
    interact.reset();
    layout.restore();
    document.body.innerHTML = '';
  });

  describe('interactables', () => {
    it('releases a selected item interactable when the item unmounts', () => {
      const { container, rerender, items } = renderScrollingTimeline({ selected: ['i0'] }, layout);
      const el = itemElement(container, 'Item 0');
      expect(interact.live.has(el)).toBe(true);

      rerender({ items: items.filter(item => item.id !== 'i0') });

      expect(interact.live.has(el)).toBe(false);
    });

    it('does not accumulate interactables while a selected row scrolls out and back', () => {
      const { container, scrollTo } = renderScrollingTimeline({
        selected: ['i0'], rowWindowing: true,
      }, layout);

      for (let i = 0; i < 3; i += 1) {
        scrollTo(30 * LINE_HEIGHT);
        expect(liveItemElements()).toHaveLength(0);
        scrollTo(0);
      }

      const live = liveItemElements();
      expect(live).toEqual([itemElement(container, 'Item 0')]);
      expect(interact.created).toBeGreaterThan(3);
    });

    it('keeps the interactable of an item that unmounts mid-drag until the drag ends', async () => {
      const { container } = renderScrollingTimeline({ selected: ['i0'] }, layout);
      const el = itemElement(container, 'Item 0');

      fire(el, 'dragstart');
      fire(el, 'dragmove', { pageX: 100, dropzone: dropzone('g3') });
      // The dragged item is now drawn in row g3; its original element is gone.
      expect(el.isConnected).toBe(false);
      expect(interact.live.has(el)).toBe(true);

      fire(el, 'dragend', { dropzone: dropzone('g3') });
      await nextTick();

      expect(interact.live.has(el)).toBe(false);
    });
  });

  describe('dragging with row windowing', () => {
    const renderDraggable = (props = {}) => renderScrollingTimeline({
      selected: ['i0'], rowWindowing: true, ...props,
    }, layout);

    it('turns on dynamic drop at drag start and restores it on drop', () => {
      const onItemMove = jest.fn();
      const { container } = renderDraggable({ onItemMove });
      const el = itemElement(container, 'Item 0');

      fire(el, 'dragstart');
      expect(interact.dynamicDrop).toHaveBeenCalledWith(true);
      expect(interact.dynamicDropValue).toBe(true);

      fire(el, 'dragmove', { pageX: 100, dropzone: dropzone('g3') });
      fire(el, 'dragend', { dropzone: dropzone('g3') });

      expect(onItemMove).toHaveBeenCalledWith('i0', expect.any(Number), 'g3');
      expect(interact.dynamicDropValue).toBe(false);
    });

    it('keeps the saved value when a drag start is reported twice', () => {
      interact.dynamicDropValue = 'previous';
      const { container } = renderDraggable();
      const el = itemElement(container, 'Item 0');

      fire(el, 'dragstart');
      fire(el, 'dragstart');
      fire(el, 'dragend');

      expect(interact.dynamicDropValue).toBe('previous');
    });

    it('restores dynamic drop when the timeline unmounts mid-drag', () => {
      const { container, unmount } = renderDraggable();
      fire(itemElement(container, 'Item 0'), 'dragstart');
      expect(interact.dynamicDropValue).toBe(true);

      unmount();

      expect(interact.dynamicDropValue).toBe(false);
    });

    it('pins the source row from drag start, before any drag move', () => {
      const { container, scrollTo } = renderDraggable();
      fire(itemElement(container, 'Item 0'), 'dragstart');

      scrollTo(30 * LINE_HEIGHT);

      expect(renderedGroupIds(container)).toContain('g0');
      expect(renderedGroupIds(container)).toContain('g30');
    });

    it('pins the source and target rows while dragging across rows', () => {
      const { container, scrollTo } = renderDraggable();
      const el = itemElement(container, 'Item 0');
      fire(el, 'dragstart');
      scrollTo(30 * LINE_HEIGHT);
      fire(el, 'dragmove', { pageX: 100, dropzone: dropzone('g35') });

      scrollTo(10 * LINE_HEIGHT);

      const ids = renderedGroupIds(container);
      expect(ids).toEqual(expect.arrayContaining(['g0', 'g10', 'g35']));
    });

    it('ends a drag released outside every row and puts the item back', () => {
      const onItemMove = jest.fn();
      const { container, scrollTo } = renderDraggable({ onItemMove });
      const el = itemElement(container, 'Item 0');
      fire(el, 'dragstart');
      fire(el, 'dragmove', { pageX: 100, dropzone: dropzone('g3') });
      expect(rowOf(itemElement(container, 'Item 0'))).toBe('g3');

      fire(el, 'dragend');

      expect(onItemMove).not.toHaveBeenCalled();
      expect(interact.dynamicDropValue).toBe(false);
      expect(rowOf(itemElement(container, 'Item 0'))).toBe('g0');
      // Nothing stays pinned once the drag is over.
      scrollTo(30 * LINE_HEIGHT);
      expect(renderedGroupIds(container)).not.toContain('g0');
    });

    it('pins the row of a resized item and does not touch dynamic drop', () => {
      const { container, scrollTo } = renderDraggable({ canResize: 'both' });
      const el = itemElement(container, 'Item 0');

      fire(el, 'resizestart');
      scrollTo(30 * LINE_HEIGHT);
      expect(renderedGroupIds(container)).toContain('g0');
      expect(interact.dynamicDrop).not.toHaveBeenCalledWith(true);

      fire(el, 'resizeend', { pageX: 0 });
      scrollTo(31 * LINE_HEIGHT);
      expect(renderedGroupIds(container)).not.toContain('g0');
      expect(interact.dynamicDropValue).toBe(false);
    });
  });

  it('positions rows from the layout being rendered while an item is dragged', () => {
    const groups = makeGroups(50);
    const { scroller, timelineRef } = renderScrollingTimeline({
      groups, items: makeItems(groups), stackItems: true, rowWindowing: true,
    }, layout);

    // Item 0 (08:00-10:00) dragged onto row g2 overlaps Item 2 there, so g2 stacks to two
    // lines and every row below it moves down by one line.
    act(() => {
      timelineRef.current.dragItem('i0', DAY_START + 8 * HOUR, 'g2');
    });
    timelineRef.current.scrollToGroup('g20', { align: 'start' });

    expect(scroller.scrollTo).toHaveBeenLastCalledWith({ top: 21 * LINE_HEIGHT, behavior: 'auto' });
  });
});

describe('row windowing with the window as scroll container', () => {
  let layout;
  let innerHeight;

  beforeEach(() => {
    layout = mockLayout();
    innerHeight = window.innerHeight;
    window.innerHeight = 300;
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => layout.geometry.scrollTop });
    window.scrollTo = jest.fn(({ top }) => {
      layout.geometry.scrollTop = top;
    });
  });

  afterEach(() => {
    interact.reset();
    layout.restore();
    window.innerHeight = innerHeight;
    delete window.scrollY;
    delete window.scrollTo;
    document.body.innerHTML = '';
  });

  function renderInPage(props = {}) {
    const container = document.body.appendChild(document.createElement('div'));
    const groups = makeGroups(50);
    const timelineRef = React.createRef();
    const utils = render(
      <Timeline
        ref={timelineRef}
        groups={groups}
        items={makeItems(groups)}
        lineHeight={LINE_HEIGHT}
        defaultTimeStart={moment(DAY_START + 6 * HOUR)}
        defaultTimeEnd={moment(DAY_START + 18 * HOUR)}
        rowWindowing
        rowWindowingOverscan={0}
        {...props}
      />,
      { container },
    );
    const scrollTo = top => act(() => {
      layout.geometry.scrollTop = top;
      fireEvent.scroll(window);
    });
    return { ...utils, timelineRef, scrollTo };
  }

  it('windows rows against the window viewport', () => {
    const { container, scrollTo } = renderInPage();
    expect(renderedGroupIds(container)).toHaveLength(10);

    scrollTo(20 * LINE_HEIGHT);

    expect(renderedGroupIds(container)[0]).toBe('g20');
    expect(renderedGroupIds(container)).toHaveLength(10);
  });

  it('scrolls the window to a group', () => {
    const { container, timelineRef } = renderInPage();

    act(() => {
      timelineRef.current.scrollToGroup('g30');
      fireEvent.scroll(window);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 31 * LINE_HEIGHT - 300, behavior: 'auto' });
    expect(renderedGroupIds(container)).toContain('g30');
  });

  it('switches to an ancestor that becomes scrollable on refreshRowWindow', () => {
    const { container, timelineRef } = renderInPage();
    const wrapper = container;
    wrapper.setAttribute('data-testid', 'scroller');
    wrapper.style.overflowY = 'auto';
    Object.defineProperty(wrapper, 'clientHeight', { configurable: true, value: 150 });

    act(() => {
      timelineRef.current.refreshRowWindow();
    });
    expect(renderedGroupIds(container)).toHaveLength(5);

    act(() => {
      layout.geometry.scrollTop = 10 * LINE_HEIGHT;
      fireEvent.scroll(wrapper);
    });
    expect(renderedGroupIds(container)[0]).toBe('g10');
  });
});
