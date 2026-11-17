import {
  getVisibleRowRange,
  getRenderedRowIndices,
  getRowSegments,
  getVerticalScrollParent,
} from 'lib/utility/rowWindow';

// Heights 30, 60, 30, 30, 90, 30 → tops 0, 30, 90, 120, 150, 240 (total 270)
const groupHeights = [30, 60, 30, 30, 90, 30];
const groupTops = [0, 30, 90, 120, 150, 240];

describe('getVisibleRowRange', () => {
  it('returns rows overlapping the viewport', () => {
    expect(getVisibleRowRange(groupTops, groupHeights, { top: 40, bottom: 130 })).toEqual({ start: 1, end: 4 });
  });

  it('treats a row ending exactly at the viewport top as hidden', () => {
    expect(getVisibleRowRange(groupTops, groupHeights, { top: 30, bottom: 60 })).toEqual({ start: 1, end: 2 });
  });

  it('extends the range by the overscan', () => {
    expect(getVisibleRowRange(groupTops, groupHeights, { top: 100, bottom: 110 }, 20)).toEqual({ start: 1, end: 4 });
  });

  it('clamps to the rows that exist', () => {
    expect(getVisibleRowRange(groupTops, groupHeights, { top: -500, bottom: 5000 })).toEqual({ start: 0, end: 6 });
    expect(getVisibleRowRange(groupTops, groupHeights, { top: 1000, bottom: 1200 })).toEqual({ start: 6, end: 6 });
    expect(getVisibleRowRange([], [], { top: 0, bottom: 100 })).toEqual({ start: 0, end: 0 });
  });
});

describe('getRenderedRowIndices', () => {
  it('returns the range when nothing is pinned', () => {
    expect(getRenderedRowIndices({ start: 2, end: 5 }, [], 10)).toEqual([2, 3, 4]);
  });

  it('adds pinned rows outside the range in order, without duplicates', () => {
    expect(getRenderedRowIndices({ start: 2, end: 5 }, [8, 3, 0, 42], 10)).toEqual([0, 2, 3, 4, 8]);
  });
});

describe('getRowSegments', () => {
  it('puts a spacer before rows that do not follow the previous rendered row', () => {
    expect(getRowSegments([0, 2, 3, 5], groupTops, groupHeights)).toEqual([
      { index: 0, spacerBefore: 0 },
      { index: 2, spacerBefore: 60 },
      { index: 3, spacerBefore: 0 },
      { index: 5, spacerBefore: 90 },
    ]);
  });

  it('offsets the first rendered row by the rows above it', () => {
    expect(getRowSegments([4], groupTops, groupHeights)).toEqual([{ index: 4, spacerBefore: 150 }]);
  });
});

describe('getVerticalScrollParent', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('finds the closest ancestor that scrolls vertically', () => {
    const outer = document.createElement('div');
    outer.style.overflowY = 'auto';
    const middle = document.createElement('div');
    middle.style.overflow = 'hidden';
    const inner = document.createElement('div');
    outer.appendChild(middle);
    middle.appendChild(inner);
    document.body.appendChild(outer);

    expect(getVerticalScrollParent(inner)).toBe(outer);
  });

  it('falls back to the window', () => {
    const el = document.body.appendChild(document.createElement('div'));
    expect(getVerticalScrollParent(el)).toBe(window);
  });
});
