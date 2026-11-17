/**
 * Helpers for row windowing: rendering only the group rows that overlap the
 * vertical viewport of the timeline's scroll container.
 *
 * Every group is still stacked, so `groupTops` / `groupHeights` describe the full
 * layout. These helpers only decide which of those rows get mounted.
 */

const SCROLLABLE_OVERFLOW = /(auto|scroll|overlay)/;

/**
 * Nearest ancestor (starting at `element` itself) that scrolls vertically, or
 * `window` when the page itself scrolls.
 * @param {HTMLElement} element
 * @returns {HTMLElement|Window}
 */
export function getVerticalScrollParent(element) {
  if (typeof window === 'undefined') {
    return null;
  }
  let node = element;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node.nodeType === 1) {
      const { overflowY } = window.getComputedStyle(node);
      if (SCROLLABLE_OVERFLOW.test(overflowY)) {
        return node;
      }
    }
    node = node.parentElement;
  }
  return window;
}

function getFallbackViewportHeight() {
  return typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 1000;
}

/**
 * Measures which vertical slice of the rows (in px from the top of the first row)
 * is inside the scroll container's viewport.
 * @param {HTMLElement} rowsElement element whose top edge is the top of the first row
 * @param {HTMLElement|Window} scrollParent
 * @returns {{ top: number, bottom: number }}
 */
export function measureRowViewport(rowsElement, scrollParent) {
  const rowsTop = rowsElement.getBoundingClientRect().top;
  let viewTop = 0;
  let viewHeight = 0;
  if (!scrollParent || scrollParent === window) {
    viewHeight = window.innerHeight;
  } else {
    viewTop = scrollParent.getBoundingClientRect().top + (scrollParent.clientTop || 0);
    viewHeight = scrollParent.clientHeight;
  }
  if (!viewHeight) {
    // Not laid out yet (or no layout engine): assume one window-height of rows.
    viewHeight = getFallbackViewportHeight();
  }
  const top = viewTop - rowsTop;
  return { top, bottom: top + viewHeight };
}

/**
 * Index of the first row whose bottom edge is below `y`.
 */
function firstRowEndingAfter(groupTops, groupHeights, y) {
  let low = 0;
  let high = groupTops.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (groupTops[mid] + groupHeights[mid] <= y) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Index of the first row that starts at or below `y`.
 */
function firstRowStartingAtOrAfter(groupTops, y) {
  let low = 0;
  let high = groupTops.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (groupTops[mid] < y) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Range of rows `[start, end)` overlapping the vertical span `[top - overscan, bottom + overscan]`.
 * @param {number[]} groupTops
 * @param {number[]} groupHeights
 * @param {{ top: number, bottom: number }} viewport px relative to the top of the first row
 * @param {number} overscan extra px rendered above and below the viewport
 * @returns {{ start: number, end: number }}
 */
export function getVisibleRowRange(groupTops, groupHeights, viewport, overscan = 0) {
  const count = groupTops.length;
  if (count === 0 || !viewport) {
    return { start: 0, end: 0 };
  }
  const from = viewport.top - overscan;
  const to = viewport.bottom + overscan;
  const start = Math.min(firstRowEndingAfter(groupTops, groupHeights, from), count);
  const end = Math.max(firstRowStartingAtOrAfter(groupTops, to), start);
  return { start, end };
}

/**
 * Sorted, de-duplicated row indices to render: the visible range plus any pinned rows.
 * @param {{ start: number, end: number }} range
 * @param {number[]} pinnedIndices
 * @param {number} count number of groups
 * @returns {number[]}
 */
export function getRenderedRowIndices(range, pinnedIndices, count) {
  const indices = [];
  for (let i = range.start; i < range.end && i < count; i += 1) {
    indices.push(i);
  }
  const extra = pinnedIndices
    .filter(i => i >= 0 && i < count && (i < range.start || i >= range.end));
  if (extra.length === 0) {
    return indices;
  }
  return Array.from(new Set(indices.concat(extra))).sort((a, b) => a - b);
}

/**
 * Turns rendered row indices into render instructions, inserting a spacer before every
 * row that does not directly follow the previous rendered row. Spacers keep each rendered
 * row at its stacked `groupTops` position.
 * @param {number[]} indices sorted row indices
 * @param {number[]} groupTops
 * @param {number[]} groupHeights
 * @returns {Array<{ index: number, spacerBefore: number }>}
 */
export function getRowSegments(indices, groupTops, groupHeights) {
  let nextTop = 0;
  return indices.map(index => {
    const spacerBefore = Math.max(groupTops[index] - nextTop, 0);
    nextTop = groupTops[index] + groupHeights[index];
    return { index, spacerBefore };
  });
}

export function rowRangesEqual(a, b) {
  return a.start === b.start && a.end === b.end;
}
