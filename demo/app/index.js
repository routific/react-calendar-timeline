import './styles.scss'

import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import DemoMain from './demo-main'
import DemoPerformance from './demo-performance'
import DemoTreeGroups from './demo-tree-groups'
import DemoLinkedTimelines from './demo-linked-timelines'
import DemoElementResize from './demo-element-resize'
import DemoRenderers from './demo-renderers'
import DemoVerticalClasses from './demo-vertical-classes'
import DemoCustomItems from './demo-custom-items'
import DemoHeaders from './demo-headers'
import DemoCustomInfoLabel from './demo-custom-info-label'
import DemoControlledSelect from './demo-controlled-select'
import DemoClustering from './demo-clustering'
import DemoClusteringCustomRender from './demo-clustering-custom-render'
import DemoClusteringIncreasedHoverAffordance from './demo-clustering-increased-hover-affordance'

const demos = {
  main: DemoMain,
  performance: DemoPerformance,
  treeGroups: DemoTreeGroups,
  linkedTimelines: DemoLinkedTimelines,
  elementResize: DemoElementResize,
  renderers: DemoRenderers,
  verticalClasses: DemoVerticalClasses,
  customItems: DemoCustomItems,
  customHeaders: DemoHeaders,
  customInfoLabel: DemoCustomInfoLabel,
  controledSelect: DemoControlledSelect,
  clusteringItems: DemoClustering,
  clusteringItemsCustomRender: DemoClusteringCustomRender,
  clusteringHoverAffordance: DemoClusteringIncreasedHoverAffordance,
}

const demoKeys = Object.keys(demos)
const defaultDemo = demoKeys[0]

function getDemoKeyFromHash() {
  const key = window.location.hash.replace(/^#\/?/, '')
  return demos[key] ? key : defaultDemo
}

function setDemoHash(key) {
  const next = `#/${key}`
  if (window.location.hash !== next) {
    window.location.hash = next
  }
}

export default function App() {
  const [activeDemo, setActiveDemo] = useState(getDemoKeyFromHash)

  useEffect(() => {
    const syncFromHash = () => {
      const key = getDemoKeyFromHash()
      setActiveDemo(key)
      if (window.location.hash.replace(/^#\/?/, '') !== key) {
        setDemoHash(key)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const ActiveDemo = demos[activeDemo]

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div
          className={`demo-row${
            activeDemo.indexOf('sticky') >= 0 ? ' sticky' : ''
          }`}
        >
          Choose the demo:
          {demoKeys.map(key => (
            <a
              key={key}
              href={`#/${key}`}
              className={activeDemo === key ? 'selected' : ''}
              onClick={event => {
                event.preventDefault()
                setDemoHash(key)
                setActiveDemo(key)
              }}
            >
              {key}
            </a>
          ))}
        </div>
        <div className="demo-demo">
          <ActiveDemo />
        </div>
      </div>
    </DndProvider>
  )
}
