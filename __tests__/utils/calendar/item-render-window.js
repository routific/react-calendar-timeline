import {
  getItemRenderWindow,
  isItemInRenderWindow,
} from 'lib/utility/calendar'
import { sortByItemTimeStart } from 'lib/utility/generic'
import { defaultKeys } from 'lib/default-config'

describe('item render window culling helpers', () => {
  it('expands visible range by buffer ratio on each side', () => {
    const { renderTimeStart, renderTimeEnd } = getItemRenderWindow(1000, 2000, 0.5)
    expect(renderTimeStart).toBe(500)
    expect(renderTimeEnd).toBe(2500)
  })

  it('detects items overlapping the render window', () => {
    const item = { start_time: 800, end_time: 900 }
    expect(isItemInRenderWindow(item, defaultKeys, 500, 2500)).toBe(true)
    expect(isItemInRenderWindow(item, defaultKeys, 1000, 2000)).toBe(false)
  })
})

describe('sortByItemTimeStart', () => {
  it('sorts by start_time without mutating the input', () => {
    const items = [
      { id: 2, start_time: 200 },
      { id: 1, start_time: 100 },
    ]
    const sorted = sortByItemTimeStart(items, 'start_time')
    expect(sorted.map(i => i.id)).toEqual([1, 2])
    expect(items.map(i => i.id)).toEqual([2, 1])
  })
})
