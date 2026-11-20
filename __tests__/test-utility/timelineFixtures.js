import moment from 'moment';

export const LINE_HEIGHT = 30;
export const DAY_START = moment('2026-11-17T00:00:00Z').valueOf();
export const HOUR = 60 * 60 * 1000;

export function makeGroups(count, prefix = 'g') {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, title: `Group ${i}` }));
}

/** One item per group from 08:00 to 10:00. */
export function makeItems(groups, prefix = 'i') {
  return groups.map((group, i) => ({
    id: `${prefix}${i}`,
    group: group.id,
    title: `Item ${i}`,
    start_time: DAY_START + 8 * HOUR,
    end_time: DAY_START + 10 * HOUR,
  }));
}

/**
 * jsdom has no layout. This gives every element a 1150px wide box at the top of the
 * viewport, so the timeline has a width and renders its items.
 */
export function mockLayout() {
  const spy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    top: 0, bottom: 0, left: 0, right: 1150, width: 1150, height: 0, x: 0, y: 0,
  }));
  return {
    restore() {
      spy.mockRestore();
    },
  };
}

export const itemElement = (container, title) => Array.from(container.querySelectorAll('.rct-item'))
  .find(el => el.textContent === title);
