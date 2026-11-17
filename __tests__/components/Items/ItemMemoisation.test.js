import React from 'react';
import moment from 'moment';
import { render } from '@testing-library/react';
import Timeline from 'lib/Timeline';
import GroupRow from 'lib/rows/GroupRow';
import RowItems from 'lib/items/Items';
import { isSameCluster } from 'lib/utility/calendar';
import {
  LINE_HEIGHT,
  DAY_START,
  HOUR,
  makeGroups,
  makeItems,
  mockLayout,
} from 'test-utility/rowWindowingHarness';

const MINUTE = 60 * 1000;

function countingRenderer(calls) {
  // eslint-disable-next-line react/display-name
  return ({ item, getItemProps, itemContext }) => {
    calls.push({ id: item.id, item, dimensions: itemContext.dimensions });
    return <div {...getItemProps()}>{item.title}</div>;
  };
}

function renderTimeline(props) {
  const container = document.body.appendChild(document.createElement('div'));
  const allProps = {
    lineHeight: LINE_HEIGHT,
    defaultTimeStart: moment(DAY_START + 6 * HOUR),
    defaultTimeEnd: moment(DAY_START + 18 * HOUR),
    ...props,
  };
  const utils = render(<Timeline {...allProps} />, { container });
  return {
    ...utils,
    rerender: nextProps => utils.rerender(<Timeline {...allProps} {...nextProps} />),
  };
}

const idsOf = calls => calls.map(call => call.id).sort();

describe('Item memoisation', () => {
  let layout;

  beforeEach(() => {
    layout = mockLayout();
  });

  afterEach(() => {
    layout.restore();
    document.body.innerHTML = '';
  });

  it('only re-renders the item that changed when items and groups are new arrays', () => {
    const calls = [];
    const itemRenderer = countingRenderer(calls);
    const groups = makeGroups(10);
    const items = makeItems(groups);
    const { rerender } = renderTimeline({ groups, items, itemRenderer });
    calls.length = 0;

    const movedItems = items.map(item => (item.id === 'i3'
      ? { ...item, start_time: item.start_time + 30 * MINUTE, end_time: item.end_time + 30 * MINUTE }
      : item));
    rerender({ groups: [...groups], items: movedItems });

    expect(idsOf(calls)).toEqual(['i3']);
  });

  it('re-renders a moved item with its new dimensions', () => {
    const calls = [];
    const itemRenderer = countingRenderer(calls);
    const groups = makeGroups(3);
    const items = makeItems(groups);
    const { rerender } = renderTimeline({ groups, items, itemRenderer });
    const before = calls.filter(call => call.id === 'i1').pop().dimensions;
    calls.length = 0;

    const movedItems = items.map(item => (item.id === 'i1'
      ? { ...item, start_time: item.start_time + HOUR, end_time: item.end_time + HOUR }
      : item));
    rerender({ items: movedItems });

    expect(idsOf(calls)).toEqual(['i1']);
    expect(calls[0].dimensions.left).toBeGreaterThan(before.left);
  });

  it('does not re-render items when an unrelated prop changes', () => {
    const calls = [];
    const itemRenderer = countingRenderer(calls);
    const groups = makeGroups(5);
    const items = makeItems(groups);
    const { rerender } = renderTimeline({ groups, items, itemRenderer });
    calls.length = 0;

    rerender({ rowData: { anything: true }, groups: [...groups], items: [...items] });

    expect(calls).toHaveLength(0);
  });

  it('keeps items below an inserted row from re-rendering', () => {
    const calls = [];
    const itemRenderer = countingRenderer(calls);
    const groups = makeGroups(5);
    const items = makeItems(groups);
    const { rerender } = renderTimeline({ groups, items, itemRenderer });
    calls.length = 0;

    const inserted = { id: 'new', title: 'New group' };
    const newItem = {
      id: 'i-new', group: 'new', title: 'New', start_time: DAY_START + 8 * HOUR, end_time: DAY_START + 9 * HOUR,
    };
    rerender({ groups: [inserted, ...groups], items: [newItem, ...items] });

    expect(idsOf(calls)).toEqual(['i-new']);
  });

  it('passes the same dimensions object while its values are unchanged', () => {
    const calls = [];
    const itemRenderer = countingRenderer(calls);
    const groups = makeGroups(2);
    const items = makeItems(groups);
    const { rerender } = renderTimeline({ groups, items, itemRenderer, selected: [] });
    const first = calls.filter(call => call.id === 'i0').pop().dimensions;
    calls.length = 0;

    // Selecting forces the item to render again; its geometry is unchanged.
    rerender({ groups: [...groups], items: [...items], selected: ['i0'] });

    expect(idsOf(calls)).toEqual(['i0']);
    expect(calls[0].dimensions).toBe(first);
  });

  describe('clusters', () => {
    const clusterSettings = {
      tinyItemSize: 1,
      clusteringRange: 5,
    };

    function tinyStops(groups) {
      const items = [];
      groups.forEach((group, g) => {
        for (let s = 0; s < 4; s += 1) {
          const start = DAY_START + 8 * HOUR + s * 2 * MINUTE;
          items.push({
            id: `stop-${g}-${s}`,
            group: group.id,
            title: `Stop ${g}-${s}`,
            start_time: start,
            end_time: start + MINUTE,
            canCluster: true,
          });
        }
      });
      return items;
    }

    it('does not re-render clusters of other rows when one row changes', () => {
      const calls = [];
      const clusterCalls = [];
      const groups = makeGroups(4);
      const items = tinyStops(groups);
      const { rerender } = renderTimeline({
        groups,
        items,
        clusterSettings,
        itemRenderer: countingRenderer(calls),
        itemRendererCluster: countingRenderer(clusterCalls),
      });
      expect(clusterCalls.length).toBeGreaterThanOrEqual(4);
      clusterCalls.length = 0;
      calls.length = 0;

      const changed = items.map(item => (item.id === 'stop-2-0' ? { ...item, title: 'changed' } : item));
      rerender({ groups: [...groups], items: changed });

      expect(calls).toHaveLength(0);
      expect(clusterCalls.map(call => call.item.group)).toEqual(['g2']);
      expect(clusterCalls[0].item.items.map(i => i.title)).toContain('changed');
    });

    it('gives the layout and the cluster renderer the same cluster object', () => {
      const clusterCalls = [];
      const rowItems = {};
      // eslint-disable-next-line react/display-name
      const rowRenderer = ({ group, getRowItems }) => {
        rowItems[group.id] = getRowItems();
        return <GroupRow><RowItems /></GroupRow>;
      };
      const groups = makeGroups(2);
      const items = tinyStops(groups);
      const { rerender } = renderTimeline({
        groups,
        items,
        clusterSettings,
        rowRenderer,
        itemRendererCluster: countingRenderer(clusterCalls),
      });

      rerender({ groups: [...groups], items: [...items], rowData: {} });

      const rendered = clusterCalls.filter(call => call.item.group === 'g0').pop().item;
      expect(rowItems.g0).toContain(rendered);
    });

    it('re-renders clusters with the new settings when the settings change', () => {
      const clusterCalls = [];
      const groups = makeGroups(2);
      const items = tinyStops(groups);
      const { rerender } = renderTimeline({
        groups, items, clusterSettings, itemRendererCluster: countingRenderer(clusterCalls),
      });
      const before = clusterCalls.filter(call => call.item.group === 'g0').pop().item;
      expect(before.isTinyItem).toBeUndefined();
      clusterCalls.length = 0;

      // Settings alone re-render the clusters; the next stack (here a new items array)
      // builds new cluster objects instead of reusing ones made with the old settings.
      rerender({ clusterSettings: { ...clusterSettings, enableIncreasedHoverOnTinyItem: true } });
      expect(clusterCalls.filter(call => call.item.group === 'g0').pop().item.isTinyItem).toBe(true);

      rerender({
        clusterSettings: { ...clusterSettings, enableIncreasedHoverOnTinyItem: true, tinyItemSize: 0.9 },
        items: [...items],
      });
      const after = clusterCalls.filter(call => call.item.group === 'g0').pop().item;
      expect(after).not.toBe(before);
      expect(after.isTinyItem).toBe(true);
    });
  });

  describe('inputs that are not part of the item', () => {
    it('re-renders every item when the item renderer function changes', () => {
      const calls = [];
      const groups = makeGroups(3);
      const items = makeItems(groups);
      const { rerender } = renderTimeline({ groups, items, itemRenderer: countingRenderer(calls) });
      calls.length = 0;

      rerender({ itemRenderer: countingRenderer(calls) });

      expect(idsOf(calls)).toEqual(['i0', 'i1', 'i2']);
    });

    it('re-renders every item when useResizeHandle changes', () => {
      const calls = [];
      const groups = makeGroups(2);
      const items = makeItems(groups);
      const itemRenderer = countingRenderer(calls);
      const { rerender } = renderTimeline({ groups, items, itemRenderer });
      calls.length = 0;

      rerender({ useResizeHandle: true });

      expect(idsOf(calls)).toEqual(['i0', 'i1']);
    });

    it('does not re-render items for a new clusterSettings object with the same values', () => {
      const calls = [];
      const groups = makeGroups(2);
      const items = makeItems(groups);
      const itemRenderer = countingRenderer(calls);
      const { rerender } = renderTimeline({
        groups, items, itemRenderer, clusterSettings: { tinyItemSize: 1, clusteringRange: 5 },
      });
      calls.length = 0;

      rerender({ clusterSettings: { tinyItemSize: 1, clusteringRange: 5 } });

      expect(calls).toHaveLength(0);
    });
  });

  describe('isSameCluster', () => {
    const a = { id: 'x' };
    const b = { id: 'y' };
    const cluster = {
      id: 'Cluster g-x-y', isCluster: true, start_time: 1, end_time: 2, items: [a, b],
    };

    it('matches a rebuilt cluster over the same items', () => {
      expect(isSameCluster(cluster, { ...cluster, items: [a, b] })).toBe(true);
    });

    it('ignores the tiny-item flag written while rendering', () => {
      expect(isSameCluster({ ...cluster, isTinyItem: true }, { ...cluster, items: [a, b] })).toBe(true);
    });

    it('rejects a cluster whose items or span changed', () => {
      expect(isSameCluster(cluster, { ...cluster, items: [a, { id: 'y' }] })).toBe(false);
      expect(isSameCluster(cluster, { ...cluster, end_time: 3 })).toBe(false);
      expect(isSameCluster(undefined, cluster)).toBe(false);
    });
  });
});
