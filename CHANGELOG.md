# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres (more or less) to [Semantic Versioning](http://semver.org/).
Change log
## 0.30.9
- Added zoomControl to the timeline. This is a boolean, default false, that will show a floating zoom control in the library. This control allows you to drag it around the screen, zoom in/out and reset. Zoom scale is set to 70%.

- Added the following libraries
--> styled-componets
--> antd and antd icons
--> draggable

- Added Custom zoom renderer to the timeline so you can pass in your own zoom control. 

- Updated Demos:
--> main: Added default zoom control to showcase zoom
--> clusteringItemsCustomRender: Added custom zoom renderer to showcase setting custom zoom in/out/reset values and using a customer renderer. Added array of timesteps to show different timesteps and different zoom levels.

- Updated timeSteps to accept either a single object or an array of objects. You can now pass in an array of timestamps that you want at different zoom levels. The array of timeSteps has a variable called timespanInMS. You need to make sure your items are ordered from the largest timespan to the smallest. Look at demo-clustering-custom-render at the variable zoomStepTimeWindows for an example.
  

## 0.30.8
version bump

## 0.30.7 

### New features
- Added enableIncreasedHoverOnTinyItem:(boolean) inside of cluster settings. This setting adds a div behind a tinyItem to make it easy to interact with. The size of this div is based on the item + a left and right buffer. This buffer is equal to 49% of the clusteringRange to make sure it does not collide with other items and their clustering ranges. Take a look at the new demo under demo-clustering-increased-hover-affordance. Note: Also added a new prop to your custom render called getTinyItemBufferProps. This returns props for the buffer div you need have which wraps your item. This will also change the position of getItemProps to relative vs absolute automatically and add padding to keep your item in the exact same space it is supposed to be.

- Added a new function, getRowItems, inside of rowRender to return all items inside of that row. This will include all items inside of a cluster.

## 0.30.5 

### Fixes and Improvements

- create local stack context for z-index @ilaiwi
- huge performance improvements @ilaiwi
- [new examples](https://github.com/namespace-ee/react-calendar-timeline/tree/rowRenderer/examples)
- `z-index`: removed for vertical lines, cursor line, horizontal lines

### New features

### [throttle zoom]
When you start to add a large number of items to the timeline, the performance dramatically shuts down. The zoom control, before this update, would try and fire as fast as it could to give you a buttery smooth experience. The issue with this is when dealing with a larger number of items, these event's fire and pile up and freeze your timeline. You can now pass in a zoomThrottle option into the timeline. (number: in milliseconds). This will make sure the zoom is throttled to only being called every X milliseconds. This improves the zoom/scroll performance when a larger number of items being are on the visible canvas. The cost of doing this is the smoothness when zooming and you need to find the right number for your items. ~50-100ms is a good place to start for > 1,000 items. Example: <Timeline zoomThrottle={75}>. 

#### [clusterItems]
This API gives the ability for users to cluster items together based on settings passed in via <Timeline clusterSettings={...}>. This helps reduce the visual noise when there are lots of items and also improves performance in most cases; This is due to the reduced number of items rendered on the page.

The cluster is basically just another item on the timeline, but has items that contain everything clustered within it. It is just an item, with it's own renderer. Note: Dragging and resizing is disabled on clustering.

The basic concept of clustering is based on the canvas size. We will only cluster items if their duration is less than a certain percentage that you set in the settings. This will allow items to cluster when zooming and stay consitent accross screen sizes. 

Definitions: 
-> clusterSettings:
.This is an object passed onto the timeline with settings to enable clustering. This is what triggers the library to cluster: <Timeline clusterSettings={...}>. 

-> tinyItemSize: (number: default 0.4)
. The maximum size of the item we want to cluster in percentage of the canvas size.

-> clusteringRange: (number: default 2.2)
. The distance between an item we want to cluster and it's surrounding items. We will only cluster items within this range.

-> sequencialClusterTinyItemsOnly: (boolean: default True)
. After the initial clustering, by default, we will only cluster to other tinyItem's. If you set this value to false in the settings, we will cluster any item within the clustering range, no matter the size. This helps performance with larger items.

-> disableClusteringBelowTime: (number:):
.If you would like to disable clustering when the canvas is certain size, pass in the ms duration that you would like to disable clustering below. For example, say you wanted to disable clustering when the canvas size is disaplaying a duration that is less than 5 hours. you would pass in. 18000000: (1000 * 60 * 60 * 5) = 5 hours. When the canvas duration is below these 5 hours, clustering will be disabled. 

-> itemRendererCluster
.If you want to control how a cluster is rendered on the timeline, pass in your own render function into the timeline, just like itemRender. Example <Timeline  clusterSettings={} itemRendererCluster={clusterItemRenderer}> The item returned will have all the items inside of the cluster accessable via .items. See the tool tip example inside of demo-clustering-custom-render/ItemRenderCluster.js.


The current clustering algorithm works as such:
-> Go through all items from left to right
-> If an item is a tiny item, search for any item, to the left or right, that is within clustering range. 
-> If an item is found, create a cluster with those two items.
-> Continue searching to the right for a tinyItem within the clustering range and add it to the cluster.(Repeat). **Note: sequencialClusterTinyItemsOnly can be set to false to only check for items within clustering range.
-> When we get to the point where there is no item within clustering range that is a tinyItem. Then return a new item that contains all the items within it. AKA a cluster.

#### [rowRenderer](https://github.com/namespace-ee/react-calendar-timeline/tree/rowRenderer#row-renderer)

This API would give you control to add custom UI on calendar rows using a render prop. You can control what is rendered by default with the library like Items and Vertical/Horizontal lines, and the renderer will provide you the ability to render custom backgrounds and droppable layers for custom dnd.

#### [`hideHorizontalLines` prop](https://github.com/namespace-ee/react-calendar-timeline/tree/rowRenderer#hidehorizontallines)

Boolean to hide or show HorizontalLines. `true` by default. Hiding the horizontalLines will have a good impact on performance.

#### [helpers](https://github.com/namespace-ee/react-calendar-timeline/tree/rowRenderer#helpers)

Helpers are methods provided by `HelperContext`. These helpers power most of the rendered UI in the timeline like: Headers, Markers, Items and row renderers. 

### breaking changes

- `onItemMove` 

changed from `onItemMove(itemId, dragTime, newGroupOrder)` to `onItemMove(itemId, dragTime, newGroupId)`. Now you will be provided with a new group id instead of new group order

- `onItemDrag`

changed from providing `newGroupOrder` to `newGroupId`. Now you will be provided with a new group id instead of new group order

- saving state in `Item` using `itemRenderer`

if you render a stateful component via `itemRenderer` then the state will be lost because item will unmount in some cases

- You need to do `e.stopPropagation()` for all callbacks passed to `itemRenderer`

## 0.27.0

* Add unit argument to onZoom and onTimeChange callbacks
* Add `className` prop to Timeline component to override `react-calendar-timeline` class #682
* Fix injecting custom vertical line's class names for time periods longer than day

## 0.26.7

* fix scrolling with trackpad @ilaiwi #679
* remove duplicate proptype validation in `TimelineStateContext` @xat

## 0.26.6

* fix `visibleTimeStart`, `visibleTimeEnd` and `onTimeChange` not working as expected in controlled mode @ilaiwi

### examples

two new examples

#### Controlled scroll

Controlled visible port of the calendar using `visibleTimeStart` and `visibleTimeEnd`. This also limits scrolling by mouse and adds two buttons to change the visible port of the calendar

[Example Codesandbox](https://codesandbox.io/s/timeline-demo-controlled-visible-time-no-scroll-659jb)

#### Programmatically Scrolling

Using controlled scroll and react-spring to trigger scrolling and create an animation.

[Example Codesandbox](https://codesandbox.io/s/confident-waterfall-3kq2503y8p)

## 0.26.5

* improve performance by:
  - eliminate extra call of layout on state update @ilaiwi
  - eliminate unmounting and mounting of Interval Component @ilaiwi

## 0.26.4

* fix `react-calendar-timeline` not working with `react-hot-loader` #607 @ilaiwi + @westn
* add documentation for `stackItems` format #661 @tyson-kubota

## 0.26.3

* add documentation for `onItemDeselect` #350 @ilaiwi
* solve a bug where `onItemDeselect` is not triggered as expected for several item clicks #350 @ilaiwi
* fix row height on browser scaling #615 @gaston-niglia

### Packages

update to `node-sass@4.12.0` for newer versions of node.

## 0.26.2

* render the items layer after columns and rows for layring @ilaiwi

## 0.26.1

* fix issue where mouse down gets stuck when scrolling the timeline #526 @KhalidArdah

you can as well solve the issue without upgrading by adding the following style

```
.react-calendar-timeline .rct-horizontal-lines {
  -webkit-user-select: none;
  -moz-user-select: -moz-none;
  -ms-user-select: none;
  user-select: none;
}
```

[as here](https://codesandbox.io/s/timeline-demo-sticky-header-w6s5f)

## 0.26.0

#### Added

* Add `onItemDrag` prop to `<Timeline />` #517 @bettymakes
* Upgrade to Babel 7.5.0, Jest 24.8.0, Enzyme 3.10.0 @trevdor

#### Breaking

* Removed `<InfoLabel />` in favour of allowing for custom component to be rendered on move or resize. Check out the demo in `demo/app/demo-custom-info-label` for an example on how to display your own custom info label or [this example](https://codesandbox.io/s/timeline-demo-info-label-neec9).


## 0.25.4

* Move `classnames` to a production dependency

## 0.25.3

* Fixed the `undefined` classnames in TimelineHeaders #566 @trevdor

## 0.25.2

* Fixed the auto-scroll right bug in a scaled browser. #528 @cw196

## 0.25.1

* fix error when using `week` unit causing format error in `DateHeader` #562 @dkarnutsch
* fix Wheel/Mousewheel Event errors on chrome 73 #541 @ilaiwi

## 0.25.0

### Custom Headers

This new feature gives more control to dev to create customizable headers to provide better UI. Now user have more control through a set of new components to render headers. This new feature came with a breaking change though.

```jsx
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline'

<Timeline>
  <TimelineHeaders>
    <SidebarHeader>
      {({ getRootProps }) => {
        return <div {...getRootProps()}>Left</div>
      }}
    </SidebarHeader>
    <DateHeader unit="primaryHeader" />
    <DateHeader />
    <CustomHeader height={50} headerData={{someData: 'data'}} unit="year">
      {({
        headerContext: { intervals },
        getRootProps,
        getIntervalProps,
        showPeriod,
        data,
      }) => {
        return (
          <div {...getRootProps()}>
            {intervals.map(interval => {
              const intervalStyle = {
                lineHeight: '30px',
                textAlign: 'center',
                borderLeft: '1px solid black',
                cursor: 'pointer',
                backgroundColor: 'Turquoise',
                color: 'white'
              }
              return (
                <div
                  onClick={() => {
                    showPeriod(interval.startTime, interval.endTime)
                  }}
                  {...getIntervalProps({
                    interval,
                    style: intervalStyle
                  })}
                >
                  <div className="sticky">
                    {interval.startTime.format('YYYY')}
                  </div>
                </div>
              )
            })}
          </div>
        )
      }}
    </CustomHeader>
  </TimelineHeaders>
</Timeline>
```

Check out the new docs before please [here](https://github.com/namespace-ee/react-calendar-timeline/tree/custom-headers#timeline-headers)

#### removed props

* `stickyOffset` and `stickyHeader` now you can make your header sticky by following this [examples](https://github.com/namespace-ee/react-calendar-timeline/tree/master/examples#custom-item-rendering)
* `headerRef` to get the headerRef you need to pass ref callback to `TimelineHeader` component
* `headerLabelGroupHeight` and `headerLabelHeight` now you can pass a `height` prop to both `CustomHeader` and `DateHeader`
* `headerLabelFormats` and `subHeaderLabelFormats` not you can pass `formatLabel` function to `DateHeader` with label width and start and end time of intervals

## 0.23.1

* fix height calculation of stacked items is off if no item is visible in a line @Felix-N
* fix Unsubscribing markers correctly when unmounted @gaston-niglia

## 0.23.0

* improve unit tests coverage #426 - @ilaiwi
* stack items by group #384 - @acemac
* fix bug where `canMove` prop gets ignored #484 - @acemac + @ilaiwi
* fix sidebar re-render when groupHeights do not change #478 - @SDupZ

### Stack per group

now you can stack choose to stack items in individual groups by providing the property `stackItems` in group object. The property in group overrides the timeline prop `stackItems`.

```
const groups = [{ id: 1, title: 'group 1', stackItems: false }, { id: 2, title: 'group 2', stackItems: true }]

const items = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour')
  },
  {
    id: 2,
    group: 2,
    title: 'item 2',
    start_time: moment().add(-0.5, 'hour'),
    end_time: moment().add(0.5, 'hour')
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment().add(3, 'hour')
  }
]

ReactDOM.render(
  <div>
    Rendered by react!
    <Timeline
      groups={groups}
      items={items}
      defaultTimeStart={moment().add(-12, 'hour')}
      defaultTimeEnd={moment().add(12, 'hour')}
    />
  </div>,
  document.getElementById('root')
)
```

## 0.22.0

### Fixed

* Provided a new key `groupLabelKey` to allow splitting of the key used to render the Sidebar and the InfoLabel visible during drag operations. `groupTitleKey` continues to be used to render the Sidebar. #442 @thiagosatoshi
* fix scroll left/right causes item move/edit to be at incorrect time #401 @acemac
* now `getResizeProps` take `leftClassName` and `rightClassName` and returns className for left and right props @acemac
* fix functionality of `itemTitle` and `itemDivTitle` [issue](https://github.com/namespace-ee/react-calendar-timeline/issues/429#issuecomment-426456693) @acemac

### 0.21.0

#### fixes

* fix item dimensions not being rendered on zoom in/out @ilaiwi + @acemac
* correct `right_sidebar` to `rightTitle` in readme @maxlibin

#### breaking changes

* add `rct` to `.top-header` and `.bottom-header` to become `.rct-top-header` and `.rct-bottom-header` @Simek
* upgrade dev dependance `react@16.3` @acemac

### 0.20.0

### improvements

* eliminate extra renders on every scroll - #357 [acemac](https://github.com/acemac)

### Fixed

* When the `date` prop on a `CustomMarker` changes the marker will now move on the timeline - #421 [kevinmanncito](https://github.com/kevinmanncito) [ilaiwi](https://github.com/ilaiwi)
* Header has a bounce effect - #311 [acemac](https://github.com/acemac)

####dev

* update to `react-testing-library` version 5
* remove deprecated `toBeInDom`

### 0.19.0

### Added

* ability to set classes for timeline columns depending on its time - #364
* ability to add custom classes and custom heights to the timeline rows - #367
* add `scrollRef` to allow for programmatically scrolling timeline - #372

### Breaking

* rework item renderer to render the whole item using render prop and prop getters - #289

### 0.18.2

### Fixed

* `onCanvasClick` not fired - #383
* cursor marker disappear while hovering over item - #378

### 0.18.1

### Fixed

* Date passed to CursorMarker child is wrong - #379
* groupRenderer doesnt work for right sidebar - #377

### 0.18.0

### Fixed

* Timeline now respects changes to `headerLabelFormats` and `subHeaderLabelFormats` - #362

### Added

* timeline markers - user can have more control over markers that are rendered on the timeline. See `TimelineMarkers` section of README for documentation - #327

### Breaking

* Removed support for React 15 and lower. This is due to the fact that 16+ supports returning arrays from render, something that the TimelineMarker feature relies on.
* removed `showCursorLine` prop in favor of using the `CursorMarker` component. See `TimelineMarkers` section of README for documentation.

```diff
import Timeline,
+ {TimelineMarkers, CursorMarker}
from 'react-calendar-timeline'

<Timeline
- showCursorLine

- />
+ >

+ <TimelineMarkers>
+  <CursorMarker />
+ </TimelineMarkers>

+ </Timeline>
```

### 0.17.3

### Added

* fix issue with single row header - #359

### 0.17.2

### Added

* support passing `style` prop from item - #347
* `selected` is provided to `itemRenderer` - #348
* simplify logic for calculate dimensions and prevent item width and left properties from being unbounded - (refactoring)

### 0.17.1

### Added

* pass canvasTimeStart/End via timelineContext to the itemRenderer prop

### 0.17.0

### Breaking

* throw more descriptive error if visibleTimeStart/End and defaultTimeStart/End are not passed as props. Timeline no longer calculates visibleTime start and end from items. Removed `onTimeInit` prop as it no longer serves a purpose. - #299
* `interactjs` is a peerDependency (wasn't previously). Upped version to 1.3.4 to fix issue #297

### Fixed

* fix for issue where NaN is returned in onItemMove if the startTime is not unix timestamp #300

### 0.16.3

### Fixed

* tap on canvas now dispatches `onCanvasClicked` - #168
* regression bug related to touch zoom
* code cleanup and refactoring around group rows

### 0.16.2

### Fixed

* clicking on canvas when item is selected now calls `onCanvasClicked` - #312

### 0.16.1

### Added

* added `stickyHeader` to disable/enable timeline header sticking on scroll.
* removed `fullUpdate` prop and functionality. Labels rely on `position: sticky` to show for items that start before `visibleTimeStart`. This (should) greatly improve scroll performance.
* removed extraneous css such as `text-align: center` on `.rct-item`, `.rct-item-overflow` to simplify the dom structure of `Item.js`
* added `headerRef` callback to receive a reference to the header element. Due to the change in how the header positioning is implemented (i.e. using `position: sticky`), there is a need to use a polyfill in [certain browsers](https://caniuse.com/#feat=css-sticky) that don't support `position: sticky`. With a reference to the header dom element, you can use a polyfill to apply sticky behavior.
* `minimumWidthForItemContentVisibility` prop to control at what width inner item content is rendered.

### Breaking

* removed `fixedHeader` prop in favor of using `position: sticky` by default
* removed import of stylesheets in library code, put onus on user to handle this stylesheet

## 0.15.12

### Fixed

* Shift + Scroll via mouse wheel scrolls canvas horizontally - #281

## 0.15.11

### Fixed

* removed `preventDefault` call in item double click handler - #277

## 0.15.10

### Fixed

* fix issue with time report with onItem\* callbacks for browsers that don't support `x` property in rect object - #266

## 0.15.9

### Fixed

* header positioned incorrectly when not fixed/sticky - caused by #236

## 0.15.8

### Fixed

* propTypes error related to Item prop - #239
* onCanvasClick and onCanvasDoubleClick were being called on header click - #236

### Added

* on timeline zoom, onZoom prop is called with timelineContext - #248

## 0.15.7

This release contains a lot of code cleanup as well as an API change to the `itemRenderer` prop.

### Fixed

* peerDependency warning if using React 16 #187

  ### Added

* `timelineContext` is provided to `itemRenderer` #233

## 0.15.6

### Fixed

* Fixed issue with state not properly updated when ending resize #173
* Fixed issue with onItem\* events not reporting correct time when timeline has outer padding #227

## 0.15.5

### Fixed

* context click actually calls double click callback #225
* Removed href attribute from header divs #222

## 0.15.4

### Fixed

* Clicking on Svg element throws error #216

## 0.15.3

This version contains one crucial bug fix and a simple update to item clicks to report time. Much of the other work was around repo maintenance and preparing the repo for future development (update to dev-tooling, some documentation updates)

### Added

* Report time with all item clicks #210

### Fixed

* Drag doesn't stop when you leave the timeline canvas #182

## [0.15.0]

Plugin support and sticky header!

### Added

* Plugins system (pass them as children) @mariusandra #122
* Sticky header (`fixedHeader='sticky'`) @mariusandra #125

### Removed

* [BREAKING] Removed deprecated option to pass sidebar header content as children. Use `sidebarContent` instead. @mariusandra
* [BREAKING] Removed fixedHeader option `absolute`, which was broken and is now replaced with the option `sticky` @mariusandra

### Demo & Docs

* Notice for modern module bundlers @jlubben @mariusandra #128
* Add [treeGroups](http://namespace.ee/react-calendar-timeline-docs/#/treeGroups) demo

## [0.14.11]

Plenty of bugfixes, tests and new demos in these 0.14 patch releases.

### Fixed

* Fixed bug with `resizeDetector` and with detecting changes in `sidebarWidth` @mariusandra
* Fixed bug where order `0` was evaluated as a falsy @nicocrm #111
* Fix overflow-x with header @signalwerk

### Added

* Add meta+wheel modifier that zooms 3x the speed of the normal wheel events @mariusandra

### Changed

* Refactor `calculateDimensions` to be pure @signalwerk
* Convert `groupHeights` and `groupTops` to arrays (from objects) @mariusandra

### Demo & docs

* Add [linkedTimelines](http://namespace.ee/react-calendar-timeline-docs/#/linkedTimelines) demo
* Add [elementResize](http://namespace.ee/react-calendar-timeline-docs/#/elementResize) demo
* Add docs about modifier keys for zooming/scrolling @signalwerk

## [0.14.2]

### Changed

* Use `prop-types` instead of `React.PropTypes` to support React 15.5+. @mariusandra #110

## [0.14.0]

### Added

* Use `headerLabelFormats` and `subHeaderLabelFormats` to customise the header labels. @Slowyn #68
* Optional pluggable `resizeDetector` to detect when the element's container is resized. @Ziller321 #94

### Fixed

* Fix renders with empty `groups` array. @signalwerk #106

## [0.13.0]

### Added

* An option to add another sidebar to the right of the Timeline. @goooseman #80
* `itemRenderer` prop to allow specifying a custom component to render the items @nicocrm #103
* `groupRenderer` prop to allow specifying a custom component to render the groups @nicocrm #103
* `showCursorLine` prop to show a vertical line at the snap position @meikoudras
* You can now select multiple items if you take control of the `selected` prop and the `onItemSelect` handler. @meengit #71
* Canvas context menu handler `onCanvasContextMenu` @meikoudras

### Fixed

* Calculate width when we receive sidebar width property @jmerriweather #75
* Avoid updating updateDimensions right after updateScrollCanvas @nicocrm #87
* Fix typo collision detection in stack() @nicocrm #96
* Remove dead code @signalwerk #101
* Disable cursor style by interactjs @bkniffler #89
* Fixed header width and Header label weekday support @meikoudras #66

### Changed

* [Deprecated] To have content above the left sidebar, pass it in a `sidebarContent={<div />}` prop, not as children to the component.

## [0.11.1]

### Fixed

* Without canResize prop in items it gave a Uncaught TypeError. @tgosp

## [0.11.0]

### Added

* An option to fully update the calendar at every scroll event. With this change, labels of items are always fully visible, even if looking at a multi day event with a zoom level set at 30min. @mariusandra

## [0.10.1]

### Changed

* The left resize edge mouse cursor is now a left arrow @mariusandra

## [0.10.0]

### Added

* You can also resize items from the left now @mariusandra

## [0.9.0]

### Added

* Allow disabling selection clicks on items #58 by @sjchmiela
* Allow passing additional props to `Item`'s `<div/>` #58 by @sjchmiela
* Add `clickTolerance` so dragging more than 3 pixels is no longer a click @mariusandra

### Changed

* [BREAKING] Same arguments order (groupId, time, e) for onCanvasDoubleClick and onCanvasClick #52 by @signalwerk
* [Deprecated] `onTimeChange` now gets `updateScrollCanvas` as the third argument. Doing `this.updateScrollCanvas` is no longer needed and will be removed soon.
* Moved React & Moment from dependencies to peerDependencies #53 by @meikoudras
* Fix resizing when inside DIV #47 by @semargal
* Fix demo for IE11 #44 by @lucidlemon
* Package a .css file, not a .scss file as previously done. @mariusandra

[0.9.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.8.6...v0.9.0
[0.10.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.9.0...v0.10.0
[0.10.1]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.10.0...v0.10.1
[0.11.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.10.1...v0.11.0
[0.11.1]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.11.0...v0.11.1
[0.13.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.11.1...v0.13.0
[0.14.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.13.0...v0.14.0
[0.14.2]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.14.0...v0.14.2
[0.14.11]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.14.2...v0.14.11
[0.15.0]: https://github.com/namespace-ee/react-calendar-timeline/compare/v0.14.11...v0.15.0
