import { fireEvent, act } from '@testing-library/react';
import interact from 'interactjs';
import {
  LINE_HEIGHT,
  SCROLLER_HEIGHT,
  DAY_START,
  HOUR,
  makeGroups,
  makeItems,
  mockLayout,
  renderScrollingTimeline,
  sidebarRows,
  groupRows,
  renderedGroupIds,
  rowSpacers,
  sidebarSpacers,
} from 'test-utility/rowWindowingHarness';

jest.mock('interactjs', () => require('test-utility/interactMock').createInteractMock());

const GROUP_COUNT = 50;
const renderTimeline = (props = {}, layout = {}) => renderScrollingTimeline({ groupCount: GROUP_COUNT, ...props }, layout);

describe('Timeline row windowing', () => {
  let layout;

  beforeEach(() => {
    layout = mockLayout();
  });

  afterEach(() => {
    interact.reset();
    layout.restore();
    document.body.innerHTML = '';
  });

  it('renders every row when the option is off', () => {
    const { container } = renderTimeline({}, layout);

    expect(sidebarRows(container)).toHaveLength(GROUP_COUNT);
    expect(groupRows(container)).toHaveLength(GROUP_COUNT);
    expect(container.querySelectorAll('.rct-row-spacer')).toHaveLength(0);
  });

  it('renders the same markup with the option off as without the prop', () => {
    const groups = makeGroups(GROUP_COUNT);
    const items = makeItems(groups, [3]);
    const withoutProp = renderTimeline({ groups, items, stackItems: true }, layout).container.innerHTML;
    document.body.innerHTML = '';
    const withPropOff = renderTimeline({
      groups, items, stackItems: true, rowWindowing: false,
    }, layout).container.innerHTML;

    expect(withPropOff).toEqual(withoutProp);
  });

  it('only mounts the rows inside the scroll viewport', () => {
    const { container } = renderTimeline({ rowWindowing: true }, layout);
    const visibleRows = SCROLLER_HEIGHT / LINE_HEIGHT;

    expect(sidebarRows(container)).toHaveLength(visibleRows);
    expect(groupRows(container)).toHaveLength(visibleRows);
    expect(renderedGroupIds(container)[0]).toBe('g0');
    expect(container.querySelectorAll('.rct-item').length).toBe(visibleRows);
  });

  it('keeps the full scroll height', () => {
    const { container } = renderTimeline({ rowWindowing: true }, layout);
    const fullHeight = GROUP_COUNT * LINE_HEIGHT;

    expect(container.querySelector('.rct-outer').style.height).toBe(`${fullHeight}px`);
    expect(container.querySelector('.rct-sidebar').style.height).toBe(`${fullHeight}px`);
    expect(container.querySelector('[data-testid="scroll-element"]').style.height).toBe(`${fullHeight + 20}px`);
  });

  it('changes the rendered rows when scrolling and offsets them with spacers', () => {
    const { container, scrollTo } = renderTimeline({ rowWindowing: true }, layout);

    scrollTo(20 * LINE_HEIGHT);

    expect(renderedGroupIds(container)).toEqual(
      Array.from({ length: 10 }, (_, i) => `g${20 + i}`),
    );
    expect(rowSpacers(container)).toHaveLength(1);
    expect(rowSpacers(container)[0].style.height).toBe(`${20 * LINE_HEIGHT}px`);
    expect(sidebarSpacers(container)).toHaveLength(1);
    expect(sidebarSpacers(container)[0].style.height).toBe(`${20 * LINE_HEIGHT}px`);
    expect(sidebarRows(container)[0].textContent).toBe('Group 20');
  });

  it('keeps row parity classes of the full list', () => {
    const { container, scrollTo } = renderTimeline({ rowWindowing: true }, layout);

    scrollTo(5 * LINE_HEIGHT);

    expect(sidebarRows(container)[0].className).toContain('rct-sidebar-row-odd');
    expect(groupRows(container)[0].className).toContain('rct-hl-odd');
  });

  it('renders overscan rows above and below the viewport', () => {
    const { container, scrollTo } = renderTimeline({
      rowWindowing: true,
      rowWindowingOverscan: 3 * LINE_HEIGHT,
    }, layout);

    scrollTo(20 * LINE_HEIGHT);

    const ids = renderedGroupIds(container);
    expect(ids[0]).toBe('g17');
    expect(ids[ids.length - 1]).toBe('g32');
  });

  it('moves the window only once the viewport nears the edge of the overscan', () => {
    const { container, scrollTo } = renderTimeline({
      rowWindowing: true,
      rowWindowingOverscan: 4 * LINE_HEIGHT,
    }, layout);
    const initial = renderedGroupIds(container);
    expect(initial[initial.length - 1]).toBe('g13');

    // Viewport bottom at 330px; half the overscan (60px) still fits inside the 420px rendered.
    scrollTo(LINE_HEIGHT);
    expect(renderedGroupIds(container)).toEqual(initial);

    // Viewport bottom at 390px: 60px ahead would pass the rendered edge, so re-centre.
    scrollTo(3 * LINE_HEIGHT);
    const moved = renderedGroupIds(container);
    expect(moved[0]).toBe('g0');
    expect(moved[moved.length - 1]).toBe('g16');
  });

  it('positions rows by their stacked height when rows have different heights', () => {
    const groups = makeGroups(GROUP_COUNT);
    // Rows 0-9 hold two overlapping items and are stacked two lines tall.
    const stacked = Array.from({ length: 10 }, (_, i) => i);
    const { container, scrollTo } = renderTimeline({
      groups,
      items: makeItems(groups, stacked),
      stackItems: true,
      rowWindowing: true,
    }, layout);

    const firstPageRows = renderedGroupIds(container);
    expect(firstPageRows).toEqual(['g0', 'g1', 'g2', 'g3', 'g4']);
    expect(groupRows(container)[0].style.height).toBe(`${2 * LINE_HEIGHT}px`);

    // 10 tall rows (600px) then 10 normal rows (300px) are above this offset.
    scrollTo(900);

    expect(renderedGroupIds(container)[0]).toBe('g20');
    expect(rowSpacers(container)[0].style.height).toBe('900px');
    expect(container.querySelector('.rct-outer').style.height)
      .toBe(`${10 * 2 * LINE_HEIGHT + 40 * LINE_HEIGHT}px`);
  });

  it('keeps pinned groups mounted while they are scrolled out of view', () => {
    const { container } = renderTimeline({
      rowWindowing: true,
      rowWindowingPinnedGroupIds: ['g40'],
    }, layout);

    const ids = renderedGroupIds(container);
    expect(ids).toHaveLength(11);
    expect(ids[ids.length - 1]).toBe('g40');
    expect(rowSpacers(container)).toHaveLength(1);
    expect(rowSpacers(container)[0].style.height).toBe(`${(40 - 10) * LINE_HEIGHT}px`);
  });

  it('keeps the source and target rows of a dragged item mounted', () => {
    const { container, timelineRef } = renderTimeline({ rowWindowing: true }, layout);

    act(() => {
      timelineRef.current.dragItem('i40', DAY_START + 9 * HOUR, 'g45');
    });

    const ids = renderedGroupIds(container);
    expect(ids).toContain('g40');
    expect(ids).toContain('g45');
    expect(ids).toHaveLength(12);

    act(() => {
      timelineRef.current.dropItem('i40', DAY_START + 9 * HOUR, 'g45');
    });

    expect(renderedGroupIds(container)).toHaveLength(10);
  });

  it('re-renders the window when groups are appended', () => {
    const groups = makeGroups(5);
    const { container, rerender } = renderTimeline({
      groups, items: makeItems(groups), rowWindowing: true,
    }, layout);
    expect(groupRows(container)).toHaveLength(5);

    const moreGroups = makeGroups(30);
    rerender({ groups: moreGroups, items: makeItems(moreGroups) });

    expect(groupRows(container)).toHaveLength(10);
    expect(container.querySelector('.rct-outer').style.height).toBe(`${30 * LINE_HEIGHT}px`);
  });

  it('registers rows scrolled into view as drop targets and releases unmounted ones', () => {
    const { container, scrollTo } = renderTimeline({ rowWindowing: true }, layout);
    const firstRow = groupRows(container)[0];
    expect(interact.live.has(firstRow)).toBe(true);

    scrollTo(30 * LINE_HEIGHT);

    expect(firstRow.isConnected).toBe(false);
    expect(interact.live.has(firstRow)).toBe(false);
    const newRows = Array.from(groupRows(container));
    expect(newRows[0].dataset.groupid).toBe('g30');
    newRows.forEach(row => expect(interact.live.has(row)).toBe(true));
    expect(interact.live.size).toBe(newRows.length);
  });

  it('calls sidebarRowRef for the rows it mounts', () => {
    const refs = {};
    const sidebarRowRef = groupId => el => {
      if (el) refs[groupId] = el;
    };
    const { scrollTo } = renderTimeline({ rowWindowing: true, sidebarRowRef }, layout);
    expect(refs.g35).toBeUndefined();

    scrollTo(30 * LINE_HEIGHT);

    expect(refs.g35).toBeInstanceOf(HTMLElement);
    expect(refs.g35.textContent).toBe('Group 35');
  });

  describe('scrollToGroup', () => {
    it('scrolls a row below the viewport to the bottom edge and mounts it', () => {
      const { container, scroller, timelineRef } = renderTimeline({ rowWindowing: true }, layout);

      act(() => {
        expect(timelineRef.current.scrollToGroup('g30')).toBe(true);
        fireEvent.scroll(scroller);
      });

      expect(scroller.scrollTo).toHaveBeenCalledWith({
        top: 31 * LINE_HEIGHT - SCROLLER_HEIGHT,
        behavior: 'auto',
      });
      expect(renderedGroupIds(container)).toContain('g30');
    });

    it('does not scroll when the row is already visible with align auto', () => {
      const { scroller, timelineRef } = renderTimeline({ rowWindowing: true }, layout);

      expect(timelineRef.current.scrollToGroup('g2')).toBe(true);
      expect(scroller.scrollTo).not.toHaveBeenCalled();
    });

    it('supports start and center alignment', () => {
      const { scroller, timelineRef } = renderTimeline({}, layout);

      timelineRef.current.scrollToGroup('g20', { align: 'start', behavior: 'smooth' });
      expect(scroller.scrollTo).toHaveBeenLastCalledWith({ top: 20 * LINE_HEIGHT, behavior: 'smooth' });

      timelineRef.current.scrollToGroup('g20', { align: 'center' });
      expect(scroller.scrollTo).toHaveBeenLastCalledWith({
        top: 20 * LINE_HEIGHT - (SCROLLER_HEIGHT - LINE_HEIGHT) / 2,
        behavior: 'auto',
      });
    });

    it('returns false for an unknown group', () => {
      const { timelineRef } = renderTimeline({ rowWindowing: true }, layout);
      expect(timelineRef.current.scrollToGroup('nope')).toBe(false);
    });
  });
});
