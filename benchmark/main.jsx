/* eslint-disable react/prop-types */
import React, {
  useCallback, useImperativeHandle, useMemo, useRef, useState, forwardRef,
} from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import moment from 'moment';
import styled from 'styled-components';
import Timeline, {
  TimelineHeaders, SidebarHeader, DateHeader, GroupRow, RowItems,
} from 'timeline-under-test';
import 'timeline-under-test-css';
import { generateRoutes, ROUTES_PER_DAY, ROUTES_PER_PAGE, DAY_START, HOUR, MINUTE } from './data';
import './bench.css';

// Mirrors the routes Gantt in planning-web: 48px rows, a wide stats sidebar, clustering
// with the same settings, a custom row renderer, and renderers for several item kinds.
const LINE_HEIGHT = 48;
const SIDEBAR_WIDTH = 420;
const STOP_ICON_SIZE = 21;
const CLUSTER_SETTINGS = {
  tinyItemSize: 0.2,
  clusteringRange: 0.5,
  disableClusteringBelowTime: HOUR * 4,
  enableIncreasedHoverOnTinyItem: true,
};
const TIME_STEPS = [
  { timespanInMS: 172800000, hour: 6, minute: 1, second: 1, day: 1, month: 1, year: 1 },
  { timespanInMS: 57600000, hour: 4, minute: 1, second: 1, day: 1, month: 1, year: 1 },
  { timespanInMS: 43200000, hour: 2, minute: 1, second: 1, day: 1, month: 1, year: 1 },
  { timespanInMS: 28800000, hour: 1, minute: 1, second: 1, day: 1, month: 1, year: 1 },
];

const topOffset = height => (LINE_HEIGHT - height) / 2 - 4;

function itemStyle(item) {
  switch (item.eventType) {
    case 'SHIFT_TIME':
      return { height: 24, top: topOffset(24), borderStyle: 'none', backgroundColor: item.color, opacity: 0.25 };
    case 'ROUTE_LINE':
      return { height: 2, top: topOffset(1), borderTopWidth: 1, borderStyle: 'solid', borderColor: item.color };
    case 'DEPOT':
      return { width: 18, height: 18, borderRadius: 6, top: topOffset(18), backgroundColor: 'transparent', borderStyle: 'none' };
    case 'IDLING':
      return { height: 0, borderStyle: 'dashed none none none', borderWidth: 2, top: topOffset(1), zIndex: 79 };
    case 'PAUSED':
    case 'DELIVERING_STOP':
    default:
      return { height: STOP_ICON_SIZE, borderRadius: 4, top: topOffset(STOP_ICON_SIZE) };
  }
}

// styled-components wrappers with prop-driven styles, as planning-web's row and stop
// components use; each distinct prop combination costs a class lookup on render.
const StyledStop = styled.div`
  border-radius: 4px;
  gap: 2px;
  padding: 0 2px;
  justify-content: center;
  ${({ $late }) => ($late ? 'box-shadow: 0 0 0 1px #e03131;' : '')}
  ${({ $narrow }) => ($narrow ? 'min-width: 6px;' : 'min-width: 21px;')}
`;

const StyledRow = styled.div`
  position: relative;
  background: ${({ $background }) => $background};
  .rct-hl { background-color: transparent; border-bottom: 1px solid ${({ $border }) => $border}; }
`;

const StyledGroup = styled.div`
  opacity: ${({ $locked }) => ($locked ? 0.6 : 1)};
`;

const StatusIcon = ({ color }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="4" fill={color} />
    <path d="M3 5 L4.5 6.5 L7 3.5" stroke="#fff" strokeWidth="1.2" fill="none" />
  </svg>
);

const ItemRenderer = ({
  item, itemContext, getItemProps, getTinyItemBufferProps,
}) => {
  const itemProps = getItemProps({
    style: {
      backgroundColor: itemContext.selected ? '#ffd666' : '#ffffff',
      color: '#1e3352',
      borderColor: item.color,
      borderStyle: 'solid',
      borderWidth: 1,
      fontSize: 11,
    },
  });
  const { key: _key, ...rest } = itemProps;
  const attributes = {
    ...rest,
    style: { ...rest.style, ...itemStyle(item), lineHeight: 1, display: 'inline-flex', alignItems: 'center' },
    className: `bench-item bench-item-${item.eventType}`,
    'data-cy': `timeline-${item.eventType}-${item.id}`,
  };

  if (item.eventType === 'DELIVERING_STOP') {
    const narrow = itemContext.dimensions.width < 24;
    return (
      <div {...getTinyItemBufferProps()}>
        <StyledStop {...attributes} $late={item.late} $narrow={narrow}>
          <span className="bench-stop-number">{narrow ? '' : item.stopSequence}</span>
          {item.late ? <span className="bench-warning" title="Late">!</span> : null}
          {narrow ? null : <StatusIcon color={item.color} />}
        </StyledStop>
      </div>
    );
  }
  if (item.eventType === 'DEPOT') {
    return (
      <div {...attributes}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 1 L15 8 L8 15 L1 8 Z" fill={item.color} />
        </svg>
      </div>
    );
  }
  if (item.eventType === 'PAUSED') {
    return (
      <div {...attributes}>
        <span className="bench-pause">||</span>
      </div>
    );
  }
  return <div {...attributes} />;
};

const ClusterRenderer = ({ item, getItemProps, getTinyItemBufferProps }) => {
  const itemProps = getItemProps({
    style: {
      backgroundColor: '#ffffff', borderColor: item.items[0].color, borderStyle: 'solid', borderWidth: 1, fontSize: 11,
    },
  });
  const { key: _key, ...rest } = itemProps;
  return (
    <div {...getTinyItemBufferProps()}>
      <div {...rest} style={{ ...rest.style, ...itemStyle(item.items[0]), display: 'inline-flex', alignItems: 'center' }}>
        <span className="bench-cluster-count">{item.items.length}</span>
        <StatusIcon color={item.items[0].color} />
      </div>
    </div>
  );
};

const GroupRenderer = ({ group }) => (
  <StyledGroup className="bench-group" $locked={group.isLocked}>
    <span className="bench-avatar" style={{ backgroundColor: group.color }}>{group.title.slice(0, 1)}</span>
    <div className="bench-group-name">
      <strong>{group.title}</strong>
      <span className="bench-driver">{group.driver}</span>
    </div>
    <div className="bench-stats">
      <span><small>Stops</small><b>{group.stops}</b></span>
      <span><small>Distance</small><b>{group.distance} km</b></span>
      <span><small>Time</small><b>{group.duration}</b></span>
    </div>
  </StyledGroup>
);

const RowRenderer = ({ group }) => (
  <StyledRow className="bench-row" data-route={group.id} $background="transparent" $border={group.color}>
    <GroupRow>
      {group.isLocked ? <div className="bench-loading" /> : null}
      <RowItems />
    </GroupRow>
  </StyledRow>
);

const BenchTimeline = forwardRef(({ windowing }, ref) => {
  const [data, setData] = useState(() => generateRoutes(0, ROUTES_PER_DAY));
  const timelineRef = useRef(null);
  const rowData = useMemo(() => ({}), []);

  useImperativeHandle(ref, () => ({
    timeline: () => timelineRef.current,
    appendPage() {
      const page = generateRoutes(data.groups.length, ROUTES_PER_PAGE);
      setData(prev => ({ groups: [...prev.groups, ...page.groups], items: [...prev.items, ...page.items] }));
    },
    updateOne() {
      setData(prev => {
        const index = prev.items.findIndex(i => i.group === prev.groups[3].id && i.eventType === 'DELIVERING_STOP');
        const item = prev.items[index];
        const items = prev.items.slice();
        items[index] = { ...item, start_time: item.start_time + 5 * MINUTE, end_time: item.end_time + 5 * MINUTE };
        return { groups: [...prev.groups], items };
      });
    },
    counts: () => ({ groups: data.groups.length, items: data.items.length }),
  }), [data]);

  const groupRenderer = useCallback(props => <GroupRenderer {...props} />, []);

  return (
    <Timeline
      ref={timelineRef}
      groups={data.groups}
      items={data.items}
      lineHeight={LINE_HEIGHT}
      sidebarWidth={SIDEBAR_WIDTH}
      itemsSorted={false}
      stackItems={false}
      canMove={false}
      canResize={false}
      clusterSettings={CLUSTER_SETTINGS}
      itemRenderer={ItemRenderer}
      itemRendererCluster={ClusterRenderer}
      groupRenderer={groupRenderer}
      rowRenderer={RowRenderer}
      rowData={rowData}
      timeSteps={TIME_STEPS}
      maxZoom={3 * 24 * HOUR}
      defaultTimeStart={moment(DAY_START + 6 * HOUR)}
      defaultTimeEnd={moment(DAY_START + 20 * HOUR)}
      rowWindowing={windowing}
    >
      <TimelineHeaders className="sticky-header">
        <SidebarHeader>{({ getRootProps }) => <div {...getRootProps()}>Routes</div>}</SidebarHeader>
        <DateHeader unit="primaryHeader" height={16} />
        <DateHeader height={18} />
      </TimelineHeaders>
    </Timeline>
  );
});
BenchTimeline.displayName = 'BenchTimeline';

const afterPaint = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)));
});

async function timed(action) {
  const start = performance.now();
  action();
  await afterPaint();
  return performance.now() - start;
}

let root = null;
const benchRef = React.createRef();

window.bench = {
  async mount({ windowing = false } = {}) {
    const container = document.getElementById('root');
    return timed(() => {
      root = createRoot(container);
      flushSync(() => {
        root.render(
          <div className="bench-shell">
            <BenchTimeline ref={benchRef} windowing={windowing} />
          </div>,
        );
      });
    });
  },
  updateOne: () => timed(() => flushSync(() => benchRef.current.updateOne())),
  appendPage: () => timed(() => flushSync(() => benchRef.current.appendPage())),
  zoom: () => timed(() => flushSync(() => benchRef.current.timeline().changeZoom(0.75))),
  scroll: (by = 1200) => timed(() => {
    document.querySelector('.rct-outer').scrollTop += by;
  }),
  async scrollSteps(steps = 10, by = 120) {
    const start = performance.now();
    for (let i = 0; i < steps; i += 1) {
      document.querySelector('.rct-outer').scrollTop += by;
      // eslint-disable-next-line no-await-in-loop
      await afterPaint();
    }
    return performance.now() - start;
  },
  nodes: () => document.getElementsByTagName('*').length,
  counts: () => benchRef.current.counts(),
  renderedRows: () => document.querySelectorAll('.rct-sidebar-row').length,
  markup: () => document.querySelector('.react-calendar-timeline').outerHTML,
};
