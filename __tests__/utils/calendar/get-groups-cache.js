import { getGroupsCache, createStackCache } from 'lib/utility/calendar';
import { groups, items } from '../../../__fixtures__/itemsAndGroups';
import { props, state } from '../../../__fixtures__/stateAndProps';

describe('getGroupsCache', () => {
  it('should map of groupId:function', () => {
    const mockMethod = jest.fn();
    const result = getGroupsCache(groups, props.keys, mockMethod);
    const keys = Object.keys(result);
    expect(keys).toHaveLength(groups.length);
    keys.forEach(key => {
      expect(result[key]).toBeInstanceOf(Function);
    });
  });
  it('should cache result when passed same args', () => {
    const mockMethod = jest.fn();
    const oldResult = getGroupsCache(groups, props.keys, mockMethod);
    const newResult = getGroupsCache(groups, props.keys, mockMethod);
    const newKeys = Object.keys(newResult);
    const oldKeys = Object.keys(oldResult);
    expect(oldResult).toBe(newResult);
    expect(oldKeys).toEqual(newKeys);
    newKeys.forEach(key => {
      expect(newResult[key]).toBe(oldResult[key]);
    });
  });
  it('should cache result of methods map', () => {
    const mockMethod = jest.fn();
    const groupWithItems = {
      items,
    };
    const args = [
      groupWithItems,
      props.keys,
      state.canvasTimeStart,
      state.canvasTimeEnd,
      state.width * 3,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
    ];
    const result = getGroupsCache(groups, props.keys, mockMethod);
    const keys = Object.keys(result);
    keys.forEach(key => {
      const method = result[key];
      method(...args);
      method(...args);
      expect(mockMethod).toHaveBeenCalledTimes(1);
      // reset after checking each method before trying the next one in the groupid:method dictionary
      mockMethod.mockClear();
    });
  });
  it('should call method again if arg is different', () => {
    const mockMethod = jest.fn();
    const groupWithItems = {
      items,
    };
    const args = [
      groupWithItems,
      props.keys,
      state.canvasTimeStart,
      state.canvasTimeEnd,
      state.width * 3,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
    ];
    const newArgs = [
      groupWithItems,
      props.keys,
      state.canvasTimeStart + 1,
      state.canvasTimeEnd,
      state.width * 3,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
    ];
    const result = getGroupsCache(groups, props.keys, mockMethod);
    const keys = Object.keys(result);
    keys.forEach(key => {
      const method = result[key];
      method(...args);
      method(...newArgs);
      expect(mockMethod).toHaveBeenCalledTimes(2);
      // reset after checking each method before trying the next one in the groupid:method dictionary
      mockMethod.mockClear();
    });
  });
  it('keeps the cached method of each group id across a new groups array', () => {
    const mockMethod = jest.fn();
    const stackCache = createStackCache();
    const oldResult = getGroupsCache(groups, props.keys, mockMethod, stackCache);
    const newResult = getGroupsCache([...groups].reverse(), props.keys, mockMethod, stackCache);
    expect(newResult).not.toBe(oldResult);
    Object.keys(oldResult).forEach(key => {
      expect(newResult[key]).toBe(oldResult[key]);
    });
  });
  it('drops cached methods when keys change', () => {
    const mockMethod = jest.fn();
    const stackCache = createStackCache();
    const oldResult = getGroupsCache(groups, props.keys, mockMethod, stackCache);
    const newResult = getGroupsCache(groups, { ...props.keys }, mockMethod, stackCache);
    Object.keys(oldResult).forEach(key => {
      expect(newResult[key]).not.toBe(oldResult[key]);
    });
  });
  it('keeps separate caches apart', () => {
    const mockMethod = jest.fn();
    const first = createStackCache();
    const second = createStackCache();
    const firstResult = getGroupsCache(groups, props.keys, mockMethod, first);
    getGroupsCache([{ id: 'other' }], props.keys, mockMethod, second);
    expect(getGroupsCache([...groups], props.keys, mockMethod, first)[groups[0].id])
      .toBe(firstResult[groups[0].id]);
  });
});
