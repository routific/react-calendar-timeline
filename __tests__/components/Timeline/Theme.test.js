import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import Timeline from 'lib/Timeline'

const groups = [{ id: 1, title: 'group 1' }]
const items = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment('1995-12-25'),
    end_time: moment('1995-12-25').add(1, 'hour'),
  },
]

describe('Timeline theme', () => {
  it('applies rct-theme-dark when theme="dark"', () => {
    const { container } = render(
      <Timeline
        groups={groups}
        items={items}
        theme="dark"
        defaultTimeStart={moment('1995-12-25').add(-12, 'hour')}
        defaultTimeEnd={moment('1995-12-25').add(12, 'hour')}
      />,
    )

    expect(container.querySelector('.react-calendar-timeline.rct-theme-dark')).toBeTruthy()
  })

  it('defaults to light (no dark class)', () => {
    const { container } = render(
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={moment('1995-12-25').add(-12, 'hour')}
        defaultTimeEnd={moment('1995-12-25').add(12, 'hour')}
      />,
    )

    const root = container.querySelector('.react-calendar-timeline')
    expect(root).toBeTruthy()
    expect(root.classList.contains('rct-theme-dark')).toBe(false)
  })
})
