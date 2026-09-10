import './styles.scss'

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  HashRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  withRouter,
} from 'react-router-dom'
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

class Menu extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }

  render() {
    let pathname = (this.props.location || {}).pathname

    if (!pathname || pathname === '/') {
      pathname = `/${demoKeys[0]}`
    }

    return (
      <div
        className={`demo-row${
          pathname.indexOf('sticky') >= 0 ? ' sticky' : ''
        }`}
      >
        Choose the demo:
        {demoKeys.map(key => (
          <Link
            key={key}
            className={pathname === `/${key}` ? 'selected' : ''}
            to={`/${key}`}
          >
            {key}
          </Link>
        ))}
      </div>
    )
  }
}

const MenuWithRouter = withRouter(Menu)

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <DndProvider backend={HTML5Backend}>
            <MenuWithRouter />
            <div className="demo-demo">
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => <Redirect to={`/${demoKeys[0]}`} />}
                />
                {demoKeys.map(key => (
                  <Route
                    key={key}
                    path={`/${key}`}
                    component={demos[key]}
                  />
                ))}
              </Switch>
            </div>
          </DndProvider>
        </div>
      </Router>
    )
  }
}

export default App
