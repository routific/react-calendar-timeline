import { getOrderedGroupsWithItems } from 'lib/utility/calendar';
import { items, groups } from '../../../__fixtures__/itemsAndGroups';
import { props } from '../../../__fixtures__/stateAndProps';

import {
  clusterSettings, canvasSize, itemsToCluster, clusterGroup,
  clusterSettingsLarge, clusterSettingsLgDisableBelow23Hours,
} from '../../../__fixtures__/clusterItems';


describe('getGroupWithItemDimensions', () => {
  it('should work as expected', () => {
    expect(getOrderedGroupsWithItems(groups, items, props.keys)).toMatchSnapshot();
  });
  it('should have all groups indexed', () => {
    const result = getOrderedGroupsWithItems(groups, items, props.keys);
    expect(Object.keys(result)).toHaveLength(groups.length);
  });
  it('should index all items into corresponding groups', () => {
    const result = getOrderedGroupsWithItems(groups, items, props.keys);
    let itemSum = 0;
    Object.keys(result).forEach((id) => {
      itemSum += result[id].items.length;
    });
    expect(itemSum).toBe(items.length);
  });
  it('should have an empty array of items if no items exist for group', () => {
    const itemsWithNoGroupId2 = items.filter(item => item.group !== '2');
    const result = getOrderedGroupsWithItems(groups, itemsWithNoGroupId2, props.keys);
    expect(Array.isArray(result['2'].items)).toBeTruthy();
    expect(result['2'].items).toHaveLength(0);
  });

  it('No items should cluster when using small cluster settings', () => {
    const expectedItemCount = 5;
    const result = getOrderedGroupsWithItems(clusterGroup, itemsToCluster, props.keys, clusterSettings, canvasSize.msBeginingOfDay, canvasSize.msEndOfDay);

    expect(result['1'].items.length).toEqual(expectedItemCount);
  });
  it('All items should cluster when the clustering settings are large', () => {
    const expectedClusterId = 'Cluster 1-1-5';
    const result = getOrderedGroupsWithItems(clusterGroup, itemsToCluster, props.keys, clusterSettingsLarge, canvasSize.msBeginingOfDay, canvasSize.msEndOfDay);

    expect(result['1'].items[0].id).toEqual(expectedClusterId);
  });
  it('Disable clustering when the setting disableClusterBelowTime is triggered.', () => {
    const expectedItemCount = 5;
    const result = getOrderedGroupsWithItems(clusterGroup, itemsToCluster, props.keys, clusterSettingsLgDisableBelow23Hours, canvasSize.msBeginingOfDay, canvasSize.msEndOfDay);

    expect(result['1'].items.length).toEqual(expectedItemCount);
  });

  it('When an item is has canCluster = false, it should not cluster', () => {
    const expectedClusterId = 'Cluster 1-1-4';
    const clusterItems = JSON.parse(JSON.stringify(itemsToCluster));

    clusterItems[clusterItems.length - 1].canCluster = false;

    const result = getOrderedGroupsWithItems(clusterGroup, clusterItems, props.keys, clusterSettingsLarge, canvasSize.msBeginingOfDay, canvasSize.msEndOfDay);

    expect(result['1'].items[0].id).toEqual(expectedClusterId);
  });

  it('When the visible canvas changes, items should cluster based on the current canvas size', () => {
    const oneDayCanvasRange = getOrderedGroupsWithItems(clusterGroup, itemsToCluster, props.keys, clusterSettings, canvasSize.msBeginingOfDay, canvasSize.msEndOfDay);
    const oneWeekCanvasRange = getOrderedGroupsWithItems(clusterGroup, itemsToCluster, props.keys, clusterSettings, canvasSize.msBeginingOfDay, canvasSize.ms1Week);

    expect(oneDayCanvasRange['1'].items.length).toBeGreaterThan(oneWeekCanvasRange['1'].items.length);
  });
});
