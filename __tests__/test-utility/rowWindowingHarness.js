import React from 'react';
import moment from 'moment';
import { render, fireEvent, act } from '@testing-library/react';
import Timeline from 'lib/Timeline';

export const LINE_HEIGHT = 30;
export const SCROLLER_HEIGHT = 300;
export const DAY_START = moment('2026-11-17T00:00:00Z').valueOf();
export const HOUR = 60 * 60 * 1000;

export function makeGroups(count) {
  return Array.from({ length: count }, (_, i) => ({ id: `g${i}`, title: `Group ${i}` }));
}

/**
 * One item per group from 08:00 to 10:00. Groups listed in `stackedGroupIndices` get a
 * second, overlapping item, so with `stackItems` those rows are two lines tall.
 */
export function makeItems(groups, stackedGroupIndices = []) {
  const items = [];
  groups.forEach((group, i) => {
    items.push({
      id: `i${i}`,
      group: group.id,
      title: `Item ${i}`,
      start_time: DAY_START + 8 * HOUR,
      end_time: DAY_START + 10 * HOUR,
    });
    if (stackedGroupIndices.includes(i)) {
      items.push({
        id: `i${i}-overlap`,
        group: group.id,
        title: `Overlap ${i}`,
        start_time: DAY_START + 9 * HOUR,
        end_time: DAY_START + 11 * HOUR,
      });
    }
  });
  return items;
}

/**
 * jsdom has no layout. This fakes the geometry the timeline reads: a scroll container
 * (`data-testid="scroller"`) of SCROLLER_HEIGHT px at the top of the viewport, rows starting
 * at the scroller's top edge, and a 1150px wide timeline container.
 */
export function mockLayout() {
  const geometry = { scrollTop: 0 };
  const rect = (top, height, width = 1150) => ({
    top, bottom: top + height, left: 0, right: width, width, height, x: 0, y: top,
  });
  const spy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function getRect() {
    const testId = this.getAttribute && this.getAttribute('data-testid');
    if (testId === 'scroller') {
      return rect(0, SCROLLER_HEIGHT);
    }
    if (testId === 'scroll-element' || (this.classList && this.classList.contains('rct-sidebar'))) {
      return rect(-geometry.scrollTop, 0);
    }
    return rect(0, 0);
  });
  // Frames run synchronously, so there is never a pending frame id to return.
  const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return null;
  });
  return {
    geometry,
    restore() {
      spy.mockRestore();
      rafSpy.mockRestore();
    },
  };
}

export function prepareScroller(scroller, geometry) {
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: SCROLLER_HEIGHT });
  Object.defineProperty(scroller, 'scrollTop', {
    configurable: true,
    get: () => geometry.scrollTop,
    set: value => {
      geometry.scrollTop = value;
    },
  });
  // eslint-disable-next-line no-param-reassign
  scroller.scrollTo = jest.fn(({ top }) => {
    geometry.scrollTop = top;
  });
}

/**
 * Renders a Timeline inside a fake scroll container (see mockLayout) and returns helpers
 * to re-render it and to scroll the container.
 */
export function renderScrollingTimeline({ groupCount = 50, ...props } = {}, { geometry } = {}) {
  const scroller = document.createElement('div');
  scroller.setAttribute('data-testid', 'scroller');
  scroller.style.overflowY = 'auto';
  document.body.appendChild(scroller);
  prepareScroller(scroller, geometry);

  const groups = props.groups || makeGroups(groupCount);
  const items = props.items || makeItems(groups);
  const timelineRef = React.createRef();
  const allProps = {
    groups,
    items,
    lineHeight: LINE_HEIGHT,
    itemHeightRatio: 0.75,
    defaultTimeStart: moment(DAY_START + 6 * HOUR),
    defaultTimeEnd: moment(DAY_START + 18 * HOUR),
    rowWindowingOverscan: 0,
    ...props,
  };
  const utils = render(<Timeline ref={timelineRef} {...allProps} />, { container: scroller });
  const rerender = nextProps => utils.rerender(<Timeline ref={timelineRef} {...allProps} {...nextProps} />);

  const scrollTo = top => {
    act(() => {
      geometry.scrollTop = top;
      fireEvent.scroll(scroller);
    });
  };

  return {
    ...utils, scroller, timelineRef, rerender, scrollTo, groups, items,
  };
}

export const sidebarRows = container => container.querySelectorAll('.rct-sidebar-row');
export const groupRows = container => container.querySelectorAll('[data-testid="groupRow"]');
export const renderedGroupIds = container => Array.from(groupRows(container)).map(row => row.dataset.groupid);
export const rowSpacers = container => container.querySelectorAll('.rct-horizontal-lines > .rct-row-spacer');
export const sidebarSpacers = container => container.querySelectorAll('.rct-sidebar .rct-row-spacer');
export const itemElement = (container, title) => Array.from(container.querySelectorAll('.rct-item'))
  .find(el => el.textContent === title);
