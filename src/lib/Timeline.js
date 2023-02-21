import PropTypes, { number } from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import Sidebar from './layout/Sidebar';
import ScrollElement from './scroll/ScrollElement';
import MarkerCanvas from './markers/MarkerCanvas';
import Rows from './rows/Rows';
import ZoomControl from './zoom';

import windowResizeDetector from '../resize-detector/window';

import {
  getMinUnit,
  calculateTimeForXPosition,
  getCanvasBoundariesFromVisibleTime,
  getCanvasWidth,
  calculateScrollCanvas,
  stackTimelineItems,
} from './utility/calendar';
import { _get, _length, _sort } from './utility/generic';
import {
  defaultKeys,
  defaultTimeSteps,
  defaultHeaderLabelFormats,
  defaultSubHeaderLabelFormats,
} from './default-config';
import { TimelineStateProvider } from './timeline/TimelineStateContext';
import { TimelineMarkersProvider } from './markers/TimelineMarkersContext';
import { TimelineHeadersProvider } from './headers/HeadersContext';
import TimelineHeaders from './headers/TimelineHeaders';
import DateHeader from './headers/DateHeader';
import DefaultLayer from './rows/DefaultLayer';
import Columns from './columns/Columns';
import { HelpersContextProvider } from './timeline/HelpersContext';

export default class ReactCalendarTimeline extends Component {
  static propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    sidebarWidth: PropTypes.number,
    rightSidebarWidth: PropTypes.number,
    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    // stickyHeader: PropTypes.bool,
    lineHeight: PropTypes.number,
    itemHeightRatio: PropTypes.number,

    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    zoomThrottle: PropTypes.number,
    zoomControl: PropTypes.bool,
    clickTolerance: PropTypes.number,

    canChangeGroup: PropTypes.bool,
    canMove: PropTypes.bool,
    canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
    useResizeHandle: PropTypes.bool,
    canSelect: PropTypes.bool,

    stackItems: PropTypes.bool,
    itemsSorted: PropTypes.bool,

    traditionalZoom: PropTypes.bool,

    itemTouchSendsClick: PropTypes.bool,

    horizontalLineClassNamesForGroup: PropTypes.func,

    onItemMove: PropTypes.func,
    onItemResize: PropTypes.func,
    onItemClick: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemDeselect: PropTypes.func,
    onCanvasClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,
    onItemContextMenu: PropTypes.func,
    onCanvasDoubleClick: PropTypes.func,
    onCanvasContextMenu: PropTypes.func,
    onZoom: PropTypes.func,
    onItemDrag: PropTypes.func,

    moveResizeValidator: PropTypes.func,

    itemRenderer: PropTypes.func,
    itemRendererCluster: PropTypes.func,
    groupRenderer: PropTypes.func,
    zoomRenderer: PropTypes.func,
    clusterSettings: PropTypes.object,
    // className: PropTypes.string,
    style: PropTypes.object,

    keys: PropTypes.shape({
      groupIdKey: PropTypes.string,
      groupTitleKey: PropTypes.string,
      groupLabelKey: PropTypes.string,
      groupRightTitleKey: PropTypes.string,
      itemIdKey: PropTypes.string,
      itemTitleKey: PropTypes.string,
      itemDivTitleKey: PropTypes.string,
      itemGroupKey: PropTypes.string,
      itemTimeStartKey: PropTypes.string,
      itemTimeEndKey: PropTypes.string,
    }),
    headerRef: PropTypes.func,
    scrollRef: PropTypes.func,
    containerRef: PropTypes.func,
    sidebarRowRef: PropTypes.func,

    timeSteps: PropTypes.oneOfType([
      PropTypes.shape({
        second: PropTypes.number,
        minute: PropTypes.number,
        hour: PropTypes.number,
        day: PropTypes.number,
        month: PropTypes.number,
        year: PropTypes.number,
      }),
      PropTypes.arrayOf(
        PropTypes.shape(
          {
            timespanInMS: PropTypes.number,
            second: PropTypes.number,
            minute: PropTypes.number,
            hour: PropTypes.number,
            day: PropTypes.number,
            month: PropTypes.number,
            year: PropTypes.number,
          },
        ),
      ),
    ]),

    defaultTimeStart: PropTypes.object,
    defaultTimeEnd: PropTypes.object,

    zoomTimeStart: number,
    zoomTimeEnd: number,

    visibleTimeStart: PropTypes.number,
    visibleTimeEnd: PropTypes.number,
    onTimeChange: PropTypes.func,
    onBoundsChange: PropTypes.func,

    selected: PropTypes.array,

    headerLabelFormats: PropTypes.shape({
      yearShort: PropTypes.string,
      yearLong: PropTypes.string,
      monthShort: PropTypes.string,
      monthMedium: PropTypes.string,
      monthMediumLong: PropTypes.string,
      monthLong: PropTypes.string,
      dayShort: PropTypes.string,
      dayLong: PropTypes.string,
      hourShort: PropTypes.string,
      hourMedium: PropTypes.string,
      hourMediumLong: PropTypes.string,
      hourLong: PropTypes.string,
    }),

    subHeaderLabelFormats: PropTypes.shape({
      yearShort: PropTypes.string,
      yearLong: PropTypes.string,
      monthShort: PropTypes.string,
      monthMedium: PropTypes.string,
      monthLong: PropTypes.string,
      dayShort: PropTypes.string,
      dayMedium: PropTypes.string,
      dayMediumLong: PropTypes.string,
      dayLong: PropTypes.string,
      hourShort: PropTypes.string,
      hourLong: PropTypes.string,
      minuteShort: PropTypes.string,
      minuteLong: PropTypes.string,
    }),

    resizeDetector: PropTypes.shape({
      addListener: PropTypes.func,
      removeListener: PropTypes.func,
    }),

    verticalLineClassNamesForTime: PropTypes.func,

    children: PropTypes.node,

    rowRenderer: PropTypes.func,
    rowData: PropTypes.object,
    hideHorizontalLines: PropTypes.bool,
  }

  static defaultProps = {
    sidebarWidth: 150,
    rightSidebarWidth: 0,
    dragSnap: 1000 * 60 * 15, // 15min
    minResizeWidth: 20,
    stickyHeader: true,
    lineHeight: 30,
    itemHeightRatio: 0.65,
    zoomControl: false,
    minZoom: 60 * 60 * 1000, // 1 hour
    maxZoom: 5 * 365.24 * 86400 * 1000, // 5 years
    zoomThrottle: 1,
    clickTolerance: 3, // how many pixels can we drag for it to be still considered a click?

    canChangeGroup: true,
    canMove: true,
    canResize: 'right',
    useResizeHandle: false,
    canSelect: true,

    stackItems: false,

    traditionalZoom: false,

    horizontalLineClassNamesForGroup: null,

    onItemMove: null,
    onItemResize: null,
    onItemClick: null,
    onItemSelect: null,
    onItemDeselect: null,
    onItemDrag: null,
    onCanvasClick: null,
    onItemDoubleClick: null,
    onItemContextMenu: null,
    onZoom: null,

    clusterSettings: null,
    itemsSorted: false,

    verticalLineClassNamesForTime: null,

    moveResizeValidator: null,

    dayBackground: null,

    defaultTimeStart: null,
    defaultTimeEnd: null,

    zoomTimeStart: null,
    zoomTimeEnd: null,

    itemTouchSendsClick: false,

    style: {},
    className: '',
    keys: defaultKeys,
    timeSteps: defaultTimeSteps,
    headerRef: () => {},
    scrollRef: () => {},
    sidebarRowRef: () => {},
    containerRef: () => {},

    // if you pass in visibleTimeStart and visibleTimeEnd, you must also pass onTimeChange(visibleTimeStart, visibleTimeEnd),
    // which needs to update the props visibleTimeStart and visibleTimeEnd to the ones passed
    visibleTimeStart: null,
    visibleTimeEnd: null,
    onTimeChange(
      visibleTimeStart,
      visibleTimeEnd,
      updateScrollCanvas,
    ) {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    },
    // called when the canvas area of the calendar changes
    onBoundsChange: null,
    children: null,

    headerLabelFormats: defaultHeaderLabelFormats,
    subHeaderLabelFormats: defaultSubHeaderLabelFormats,

    selected: null,

    rowRenderer: DefaultLayer,
    rowData: {},
    hideHorizontalLines: false,
  }

  static childContextTypes = {
    getTimelineContext: PropTypes.func,
  }

  getTimeStep = (timeSteps) => {
    if (Array.isArray(timeSteps) && timeSteps.length > 0) {
      const { visibleTimeStart, visibleTimeEnd } = this.state;
      const visibleTime = visibleTimeEnd - visibleTimeStart;
      let timeStepToReturn = timeSteps[0];
      for (let i = 1; i < timeSteps.length; i += 1) {
        if (timeSteps[i].timespanInMS >= visibleTime) {
          timeStepToReturn = timeSteps[i];
        }
      }
      return timeStepToReturn;
    }
    return timeSteps;
  }

  getChildContext() {
    return {
      getTimelineContext: () => this.getTimelineContext(),
    };
  }

  getTimelineContext = () => {
    const {
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
    } = this.state;

    return {
      timelineWidth: width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
    };
  }

  getTimelineUnit = () => {
    const {
      width,
      visibleTimeStart,
      visibleTimeEnd,
    } = this.state;

    const { timeSteps } = this.props;
    const zoom = visibleTimeEnd - visibleTimeStart;
    const minUnit = getMinUnit(zoom, width, this.getTimeStep(timeSteps));

    return minUnit;
  }

  constructor(props) {
    super(props);

    this.getSelected = this.getSelected.bind(this);
    this.hasSelectedItem = this.hasSelectedItem.bind(this);
    this.isItemSelected = this.isItemSelected.bind(this);

    let visibleTimeStart = null;
    let visibleTimeEnd = null;

    let initialTimeStart = null;
    let initialTimeEnd = null;

    if (this.props.defaultTimeStart && this.props.defaultTimeEnd) {
      visibleTimeStart = this.props.defaultTimeStart.valueOf();
      visibleTimeEnd = this.props.defaultTimeEnd.valueOf();
      initialTimeStart = this.props.defaultTimeStart.valueOf();
      initialTimeEnd = this.props.defaultTimeEnd.valueOf();
    } else if (this.props.visibleTimeStart && this.props.visibleTimeEnd) {
      visibleTimeStart = this.props.visibleTimeStart;
      visibleTimeEnd = this.props.visibleTimeEnd;
      initialTimeStart = this.props.visibleTimeStart;
      initialTimeEnd = this.props.visibleTimeEnd;
    } else {
      // throwing an error because neither default or visible time props provided
      throw new Error(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline',
      );
    }

    const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
      visibleTimeStart,
      visibleTimeEnd,
    );

    this.state = {
      width: 1000,
      zoomTimeStart: this.props.zoomTimeStart,
      zoomTimeEnd: this.props.zoomTimeEnd,
      zoomControl: this.props.zoomControl,
      zoomScalePercent: 0.7,
      initialTimeStart,
      initialTimeEnd,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
      selectedItem: null,
      dragTime: null,
      resizingItem: null,
      resizeTime: undefined,
      resizingEdge: undefined,
    };

    const canvasWidth = getCanvasWidth(this.state.width);

    const {
      groupsWithItemsDimensions,
      height,
      groupHeights,
      groupTops,
      itemsWithInteractions,
    } = stackTimelineItems(
      props.itemsSorted ? props.items : _sort(props.items),
      props.groups,
      canvasWidth,
      this.state.canvasTimeStart,
      this.state.canvasTimeEnd,
      props.keys,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
      this.state.draggingItem,
      this.state.resizingItem,
      this.state.dragTime,
      this.state.resizingEdge,
      this.state.resizeTime,
      this.state.newGroupId,
      props.clusterSettings,
    );

    /* eslint-disable react/no-direct-mutation-state */
    this.state.groupsWithItemsDimensions = groupsWithItemsDimensions;
    this.state.height = height;
    this.state.groupHeights = groupHeights;
    this.state.groupTops = groupTops;
    this.state.itemsWithInteractions = itemsWithInteractions;

    /* eslint-enable */
  }

  componentDidMount() {
    this.resize(this.props);

    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.addListener(this);
    }

    windowResizeDetector.addListener(this);

    this.lastTouchDistance = null;
  }

  componentWillUnmount() {
    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.removeListener(this);
    }

    windowResizeDetector.removeListener(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      visibleTimeStart, visibleTimeEnd, zoomTimeStart, zoomTimeEnd, items, groups,
    } = nextProps;

    // This is a gross hack pushing items and groups in to state only to allow
    // For the forceUpdate check
    let derivedState = { items, groups };

    // if the items or groups have changed we must re-render
    const forceUpdate = items !== prevState.items || groups !== prevState.groups;

    // We are a controlled component
    if (visibleTimeStart && visibleTimeEnd) {
      // Get the new canvas position
      Object.assign(
        derivedState,
        calculateScrollCanvas(
          visibleTimeStart,
          visibleTimeEnd,
          forceUpdate,
          items,
          groups,
          nextProps,
          prevState,
        ),
      );
    } else if (zoomTimeStart !== prevState.zoomTimeStart || zoomTimeEnd !== prevState.zoomTimeEnd) {
      // We want to trigger a refresh with updated time range based on zoom
      derivedState = {
        zoomTimeStart, zoomTimeEnd, items, groups,
      };
      // Get the new canvas position
      Object.assign(
        derivedState,
        calculateScrollCanvas(
          zoomTimeStart, // visibleTimeStart,
          zoomTimeEnd, // visibleTimeEnd,
          forceUpdate,
          items,
          groups,
          nextProps,
          prevState,
        ),
      );
    } else if (forceUpdate) {
      // Calculate new item stack position as canvas may have changed
      const canvasWidth = getCanvasWidth(prevState.width);
      Object.assign(
        derivedState,
        stackTimelineItems(
          items,
          groups,
          canvasWidth,
          prevState.canvasTimeStart,
          prevState.canvasTimeEnd,
          nextProps.keys,
          nextProps.lineHeight,
          nextProps.itemHeightRatio,
          nextProps.stackItems,
          prevState.draggingItem,
          prevState.resizingItem,
          prevState.dragTime,
          prevState.resizingEdge,
          prevState.resizeTime,
          prevState.newGroupId,
          nextProps.clusterSettings,
        ),
      );
    }

    return derivedState;
  }

  componentDidUpdate(prevProps, prevState) {
    const newZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const oldZoom = prevState.visibleTimeEnd - prevState.visibleTimeStart;

    // are we changing zoom? Report it!
    if (this.props.onZoom && newZoom !== oldZoom) {
      this.props.onZoom(this.getTimelineContext(), this.getTimelineUnit());
    }

    // The bounds have changed? Report it!
    if (
      this.props.onBoundsChange
      && this.state.canvasTimeStart !== prevState.canvasTimeStart
    ) {
      this.props.onBoundsChange(
        this.state.canvasTimeStart,
        this.state.canvasTimeStart + newZoom * 3,
      );
    }

    // Check the scroll is correct
    const scrollLeft = Math.round(
      this.state.width
        * (this.state.visibleTimeStart - this.state.canvasTimeStart)
        / newZoom,
    );
    const componentScrollLeft = Math.round(
      prevState.width
        * (prevState.visibleTimeStart - prevState.canvasTimeStart)
        / oldZoom,
    );
    if (componentScrollLeft !== scrollLeft) {
      this.scrollComponent.scrollLeft = scrollLeft;
      this.scrollHeaderRef.scrollLeft = scrollLeft;
    }
  }

  resize = (props = this.props) => {
    const { width: containerWidth } = this.container.getBoundingClientRect();

    const width = containerWidth - props.sidebarWidth - props.rightSidebarWidth;
    const canvasWidth = getCanvasWidth(width);
    const {
      groupsWithItemsDimensions,
      height,
      groupHeights,
      groupTops,
    } = stackTimelineItems(
      props.items,
      props.groups,
      canvasWidth,
      this.state.canvasTimeStart,
      this.state.canvasTimeEnd,
      props.keys,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
      this.state.draggingItem,
      this.state.resizingItem,
      this.state.dragTime,
      this.state.resizingEdge,
      this.state.resizeTime,
      this.state.newGroupId,
      props.clusterSettings,
    );

    this.setState({
      width,
      groupsWithItemsDimensions,
      height,
      groupHeights,
      groupTops,
    });

    this.scrollComponent.scrollLeft = width;
    this.scrollHeaderRef.scrollLeft = width;
  }

  onScroll = scrollX => {
    const width = this.state.width;

    const canvasTimeStart = this.state.canvasTimeStart;

    const zoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;

    const visibleTimeStart = canvasTimeStart + zoom * scrollX / width;

    if (
      this.state.visibleTimeStart !== visibleTimeStart
      || this.state.visibleTimeEnd !== visibleTimeStart + zoom
    ) {
      this.props.onTimeChange(
        visibleTimeStart,
        visibleTimeStart + zoom,
        this.updateScrollCanvas,
        this.getTimelineUnit(),
      );
    }
  }

  // called when the visible time changes
  updateScrollCanvas = (
    visibleTimeStart,
    visibleTimeEnd,
    forceUpdateDimensions,
    items = this.props.items,
    groups = this.props.groups,
  ) => {
    this.setState(
      calculateScrollCanvas(
        visibleTimeStart,
        visibleTimeEnd,
        forceUpdateDimensions,
        items,
        groups,
        this.props,
        this.state,
      ),
    );
  }


  changeZoom = (scale, offset = 0.5) => {
    const { minZoom, maxZoom } = this.props;
    const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const newZoom = Math.min(
      Math.max(Math.round(oldZoom * scale), minZoom),
      maxZoom,
    ); // min 1 min, max 20 years
    const newVisibleTimeStart = Math.round(
      this.state.visibleTimeStart + (oldZoom - newZoom) * offset,
    );

    this.props.onTimeChange(
      newVisibleTimeStart,
      newVisibleTimeStart + newZoom,
      this.updateScrollCanvas,
      this.getTimelineUnit(),
    );
  }

  throttleChangeZoom = _.throttle((scale, offset) => {
    this.changeZoom(scale, offset);
  }, this.props.zoomThrottle);

  handleWheelZoom = (speed, xPosition, deltaY) => {
    this.throttleChangeZoom(1.0 + speed * deltaY / 500, xPosition / this.state.width);
  }

  showPeriod = (from, to) => {
    const visibleTimeStart = from.valueOf();
    const visibleTimeEnd = to.valueOf();

    const zoom = visibleTimeEnd - visibleTimeStart;
    // can't zoom in more than to show one hour
    if (zoom < this.props.minZoom) {
      return;
    }

    this.props.onTimeChange(
      visibleTimeStart,
      visibleTimeStart + zoom,
      this.updateScrollCanvas,
      this.getTimelineUnit(),
    );
  }

  selectItem = (item, clickType, e) => {
    if (
      this.isItemSelected(item)
      || (this.props.itemTouchSendsClick && clickType === 'touch')
    ) {
      if (item && this.props.onItemClick) {
        const time = this.timeFromItemEvent(e);
        this.props.onItemClick(item, e, time);
      }
    } else {
      this.setState({ selectedItem: item });
      if (item && this.props.onItemSelect) {
        const time = this.timeFromItemEvent(e);
        this.props.onItemSelect(item, e, time);
      } else if (item === null && this.props.onItemDeselect) {
        this.props.onItemDeselect(e); // this isnt in the docs. Is this function even used?
      }
    }
  }

  doubleClickItem = (item, e) => {
    if (this.props.onItemDoubleClick) {
      const time = this.timeFromItemEvent(e);
      this.props.onItemDoubleClick(item, e, time);
    }
  }

  contextMenuClickItem = (item, e) => {
    if (this.props.onItemContextMenu) {
      const time = this.timeFromItemEvent(e);
      this.props.onItemContextMenu(item, e, time);
    }
  }

  // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
  // from.  Look to consolidate the logic for determining coordinate to time
  // as well as generalizing how we get time from click on the canvas
  getTimeFromRowClickEvent = e => {
    const { dragSnap } = this.props;
    const { width, canvasTimeStart, canvasTimeEnd } = this.state;
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page
    const { offsetX } = e.nativeEvent;

    let time = calculateTimeForXPosition(
      canvasTimeStart,

      canvasTimeEnd,
      getCanvasWidth(width),
      offsetX,
    );
    time = Math.floor(time / dragSnap) * dragSnap;

    return time;
  }

  timeFromItemEvent = e => {
    const { width, visibleTimeStart, visibleTimeEnd } = this.state;
    const { dragSnap } = this.props;

    const scrollComponent = this.scrollComponent;
    const { left: scrollX } = scrollComponent.getBoundingClientRect();

    const xRelativeToTimeline = e.clientX - scrollX;

    const relativeItemPosition = xRelativeToTimeline / width;
    const zoom = visibleTimeEnd - visibleTimeStart;
    const timeOffset = relativeItemPosition * zoom;

    let time = Math.round(visibleTimeStart + timeOffset);
    time = Math.floor(time / dragSnap) * dragSnap;

    return time;
  }

  dragItem = (item, dragTime, newGroupId) => {
    this.setState({
      draggingItem: item,
      dragTime,
      newGroupId,
    });

    this.updatingItem({
      eventType: 'move',
      itemId: item,
      time: dragTime,
      newGroupId,
    });
  }

  dropItem = (item, dragTime, newGroupId) => {
    this.setState({ draggingItem: null, dragTime: null });
    if (this.props.onItemMove) {
      this.props.onItemMove(item, dragTime, newGroupId);
    }
  }

  resizingItem = (item, resizeTime, edge) => {
    this.setState({
      resizingItem: item,
      resizingEdge: edge,
      resizeTime,
    });

    this.updatingItem({
      eventType: 'resize',
      itemId: item,
      time: resizeTime,
      edge,
    });
  }

  resizedItem = (item, resizeTime, edge, timeDelta) => {
    this.setState({ resizingItem: null, resizingEdge: null, resizeTime: null });
    if (this.props.onItemResize && timeDelta !== 0) {
      this.props.onItemResize(item, resizeTime, edge);
    }
  }

  updatingItem = ({
    eventType, itemId, time, edge, newGroupId,
  }) => {
    if (this.props.onItemDrag) {
      this.props.onItemDrag({
        eventType, itemId, time, edge, newGroupId,
      });
    }
  }

  handleRowClick = (e, rowIndex) => {
    // shouldnt this be handled by the user, as far as when to deselect an item?
    if (this.hasSelectedItem()) {
      this.selectItem(null);
    }

    if (this.props.onCanvasClick == null) return;

    const time = this.getTimeFromRowClickEvent(e);
    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey,
    );
    this.props.onCanvasClick(groupId, time, e);
  }

  handleRowDoubleClick = (e, rowIndex) => {
    if (this.props.onCanvasDoubleClick == null) return;

    const time = this.getTimeFromRowClickEvent(e);
    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey,
    );
    this.props.onCanvasDoubleClick(groupId, time, e);
  }

  handleScrollContextMenu = (e, rowIndex) => {
    if (this.props.onCanvasContextMenu == null) return;

    const timePosition = this.getTimeFromRowClickEvent(e);

    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey,
    );

    if (this.props.onCanvasContextMenu) {
      e.preventDefault();
      this.props.onCanvasContextMenu(groupId, timePosition, e);
    }
  }

  handleHeaderRef = el => {
    this.scrollHeaderRef = el;
    this.props.headerRef(el);
  }

  sidebar(height, groupHeights) {
    const { sidebarWidth } = this.props;
    return (
      sidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          groupRenderer={this.props.groupRenderer}
          keys={this.props.keys}
          width={sidebarWidth}
          groupHeights={groupHeights}
          height={height}
          sidebarRowRef={this.props.sidebarRowRef}
        />
      )
    );
  }

  rightSidebar(height, groupHeights) {
    const { rightSidebarWidth } = this.props;
    return (
      rightSidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          keys={this.props.keys}
          groupRenderer={this.props.groupRenderer}
          isRightSidebar
          width={rightSidebarWidth}
          groupHeights={groupHeights}
          height={height}
          sidebarRowRef={this.props.sidebarRowRef}
        />
      )
    );
  }

  /**
   * check if child of type TimelineHeader
   * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types
   */
  isTimelineHeader = (child) => {
    if (child.type === undefined) return false;
    return child.type.secretKey === TimelineHeaders.secretKey;
  }

  childrenWithProps() {
    if (!this.props.children) {
      return null;
    }

    // convert to an array and remove the nulls
    const childArray = Array.isArray(this.props.children)
      ? this.props.children.filter(c => c)
      : [this.props.children];

    return React.Children.map(childArray, child => {
      if (!this.isTimelineHeader(child)) {
        return child;
      }
      return null;
    });
  }

  renderHeaders = () => {
    if (this.props.children) {
      let headerRenderer;
      React.Children.map(this.props.children, child => {
        if (this.isTimelineHeader(child)) {
          headerRenderer = child;
        }
      });
      if (headerRenderer) {
        return headerRenderer;
      }
    }
    return (
      <TimelineHeaders>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    );
  }

  getSelected() {
    return this.state.selectedItem && !this.props.selected
      ? [this.state.selectedItem]
      : this.props.selected || [];
  }

  hasSelectedItem() {
    if (!Array.isArray(this.props.selected)) return !!this.state.selectedItem;
    return this.props.selected.length > 0;
  }

  isItemSelected(itemId) {
    const selectedItems = this.getSelected();
    return selectedItems.some(i => i === itemId);
  }

  getScrollElementRef = el => {
    this.props.scrollRef(el);
    this.scrollComponent = el;
  }

  render() {
    const {
      items,
      groups,
      sidebarWidth,
      rightSidebarWidth,
      timeSteps,
      traditionalZoom,
      itemRenderer,
      itemRendererCluster,
      zoomRenderer,
      keys,
      hideHorizontalLines,
    } = this.props;
    const {
      draggingItem,
      resizingItem,
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd,
    } = this.state;
    let {
      groupsWithItemsDimensions, height, groupHeights, groupTops, itemsWithInteractions,
    } = this.state;

    const zoom = visibleTimeEnd - visibleTimeStart;
    const canvasWidth = getCanvasWidth(width);
    const minUnit = getMinUnit(zoom, width, this.getTimeStep(timeSteps));

    const isInteractingWithItem = !!draggingItem || !!resizingItem;

    if (isInteractingWithItem) {
      const stackResults = stackTimelineItems(
        items,
        groups,
        canvasWidth,
        this.state.canvasTimeStart,
        this.state.canvasTimeEnd,
        this.props.keys,
        this.props.lineHeight,
        this.props.itemHeightRatio,
        this.props.stackItems,
        this.state.draggingItem,
        this.state.resizingItem,
        this.state.dragTime,
        this.state.resizingEdge,
        this.state.resizeTime,
        this.state.newGroupId,
        this.props.clusterSettings,
      );
      groupsWithItemsDimensions = stackResults.groupsWithItemsDimensions;
      height = stackResults.height;
      groupHeights = stackResults.groupHeights;
      groupTops = stackResults.groupTops;
      itemsWithInteractions = stackResults.itemsWithInteractions;
    }

    const outerComponentStyle = {
      height: `${height}px`,
    };

    const zoomControl = () => {
      if (zoomRenderer) {
        return zoomRenderer({
          onZoomIn: ({ value } = {}) => this.changeZoom(value || 1 * this.state.zoomScalePercent),
          onZoomOut: ({ value } = {}) => this.changeZoom(value || 1 / this.state.zoomScalePercent),
          onZoomReset: ({ canvasTimeStartZoom, canvasTimeEndZoom } = {}) => this.showPeriod(canvasTimeStartZoom || this.state.initialTimeStart, canvasTimeEndZoom || this.state.initialTimeEnd),
        });
      }
      if (this.props.zoomControl) {
        return <ZoomControl
        onZoomIn={() => this.changeZoom(1 * this.state.zoomScalePercent)}
        onZoomOut={() => this.changeZoom(1 / this.state.zoomScalePercent)}
        onZoomReset={() => this.showPeriod(this.state.initialTimeStart, this.state.initialTimeEnd)}/>;
      }
      return undefined;
    };
    return (
      <TimelineStateProvider
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        showPeriod={this.showPeriod}
        timelineUnit={minUnit}
        timelineWidth={this.state.width}
        keys={keys}
      >
        <TimelineMarkersProvider>
          <TimelineHeadersProvider
            registerScroll={this.handleHeaderRef}
            timeSteps={this.getTimeStep(timeSteps)}
            leftSidebarWidth={this.props.sidebarWidth}
            rightSidebarWidth={this.props.rightSidebarWidth}
          >
            <HelpersContextProvider
              groupsWithItemsDimensions={groupsWithItemsDimensions}
              items={isInteractingWithItem ? itemsWithInteractions : items}
              keys={keys}
              groupHeights={groupHeights}
              groupTops={groupTops}
            >
              <div
                style={this.props.style}
                ref={el => (this.container = el)}
                className="react-calendar-timeline"
              >
                 {zoomControl()}
                {this.renderHeaders()}
                <div style={outerComponentStyle} className="rct-outer" ref={this.props.containerRef}>
                  {sidebarWidth > 0 ? this.sidebar(height, groupHeights) : null}
                  <ScrollElement
                    scrollRef={this.getScrollElementRef}
                    width={width}
                    height={height}
                    onZoom={this.throttleChangeZoom}
                    onWheelZoom={this.handleWheelZoom}
                    traditionalZoom={traditionalZoom}
                    onScroll={this.onScroll}
                    isInteractingWithItem={isInteractingWithItem}
                  >
                    <MarkerCanvas>
                      {this.childrenWithProps()}
                      <Rows
                        items={isInteractingWithItem ? itemsWithInteractions : items}
                        groupHeights={groupHeights}
                        itemRenderer={itemRenderer}
                        itemRendererCluster={itemRendererCluster}
                        itemResized={this.resizedItem}
                        itemResizing={this.resizingItem}
                        itemSelect={this.selectItem}
                        itemDrag={this.dragItem}
                        itemDrop={this.dropItem}
                        onItemDoubleClick={this.doubleClickItem}
                        onItemContextMenu={this.contextMenuClickItem}
                        scrollRef={this.scrollComponent}
                        headerElementRef={this.scrollRef}
                        selectedItem={this.state.selectedItem}
                        onRowClick={this.handleRowClick}
                        onRowDoubleClick={this.handleRowDoubleClick}
                        onRowContextClick={this.handleScrollContextMenu}
                        groupsWithItemsDimensions={groupsWithItemsDimensions}
                        // props
                        groups={groups}
                        keys={keys}
                        resizeEdge={this.state.resizingEdge}
                        canChangeGroup={this.props.canChangeGroup}
                        canMove={this.props.canMove}
                        canResize={this.props.canResize}
                        canSelect={this.props.canSelect}
                        clusterSettings={this.props.clusterSettings}
                        useResizeHandle={this.props.useResizeHandle}
                        dragSnap={this.props.dragSnap}
                        minResizeWidth={this.props.minResizeWidth}
                        moveResizeValidator={this.props.moveResizeValidator}
                        selected={this.props.selected}
                        rowRenderer={this.props.rowRenderer}
                        rowData={this.props.rowData}
                        clickTolerance={this.props.clickTolerance}
                        horizontalLineClassNamesForGroup={
                          this.props.horizontalLineClassNamesForGroup
                        }
                      />
                      {hideHorizontalLines ? null : <Columns
                        lineCount={_length(groups)}
                        minUnit={minUnit}
                        timeSteps={this.getTimeStep(timeSteps)}
                        verticalLineClassNamesForTime={this.props.verticalLineClassNamesForTime}
                        canvasTimeStart={canvasTimeStart}
                        canvasTimeEnd={canvasTimeEnd}
                        canvasWidth={canvasWidth}
                      />}
                    </MarkerCanvas>
                  </ScrollElement>
                  {rightSidebarWidth > 0
                    ? this.rightSidebar(height, groupHeights)
                    : null}
                </div>
              </div>
            </HelpersContextProvider>
          </TimelineHeadersProvider>
        </TimelineMarkersProvider>
      </TimelineStateProvider>
    );
  }
}
