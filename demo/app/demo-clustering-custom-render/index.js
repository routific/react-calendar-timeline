/* eslint-disable no-console */
import React, { Component } from 'react';
import moment from 'moment';
// eslint-disable-next-line
import faker from 'faker';
// eslint-disable-next-line import/no-unresolved
import Timeline from 'react-calendar-timeline';
import timelineData from '../fake-timeline-data';
import clusterItemRenderer from './ItemRenderCluster';

const minTime = moment('2022-MAY-12')
  .add(-12, 'hours')
  .valueOf();
const maxTime = moment('2022-MAY-12')
  .add(36, 'hours')
  .valueOf();

const keys = {
  groupIdKey: 'id',
  groupTitleKey: 'title',
  groupRightTitleKey: 'rightTitle',
  itemIdKey: 'id',
  itemTitleKey: 'title',
  itemDivTitleKey: 'title',
  itemGroupKey: 'group',
  itemTimeStartKey: 'start',
  itemTimeEndKey: 'end',
};

const SIXTEEN_HOURS_IN_MS = 1000 * 60 * 60 * 16;

export default class App extends Component {
  constructor(props) {
    super(props);

    const items = timelineData;

    const groups = [{
      id: '30',
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
      label: `Label ${faker.name.firstName()}`,
      bgColor: 'red',
    },
    {
      id: '31',
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
      label: `Label ${faker.name.firstName()}`,
    }, {
      id: '32',
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
      label: `Label ${faker.name.firstName()}`,
    }, {
      id: '33',
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
      label: `Label ${faker.name.firstName()}`,
    }, {
      id: '34',
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
      label: `Label ${faker.name.firstName()}`,
    }];
    const defaultTimeStart = moment('2022-MAY-12')
      .startOf('day')
      .toDate();
    const defaultTimeEnd = moment('2022-MAY-12')
      .endOf('day')
      .toDate();

    groups[0].stackItems = false;
    groups[0].height = 300;
    this.state = {
      groups,
      items,
      defaultTimeStart,
      defaultTimeEnd,
    };
  }

  handleCanvasClick = (groupId, time) => {
    console.log('Canvas clicked', groupId, moment(time).format());
  }

  handleCanvasContextMenu = (group, time) => {
    console.log('Canvas context menu', group, moment(time).format());
  }

  handleItemClick = (itemId, _, time) => {
    console.log(`Clicked: ${itemId}`, moment(time).format());
  }

  handleItemSelect = (itemId, _, time) => {
    console.log(`Selected: ${itemId}`, moment(time).format());
  }

  handleItemDoubleClick = (itemId, _, time) => {
    console.log(`Double Click: ${itemId}`, moment(time).format());
  }

  handleItemContextMenu = (itemId, _, time) => {
    console.log(`Context Menu: ${itemId}`, moment(time).format());
  }

  handleItemMove = (itemId, dragTime, newGroupId) => {
    const { items, groups } = this.state;

    const group = groups.find(i => i.id === newGroupId);

    this.setState({
      items: items.map(
        item => (item.id === itemId
          ? Object.assign({}, item, {
            start: dragTime,
            end: dragTime + (item.end - item.start),
            group: group.id,
          })
          : item),
      ),
    });

    console.log('Moved', itemId, dragTime, newGroupId);
  }

  handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
      updateScrollCanvas(minTime, maxTime);
    } else if (visibleTimeStart < minTime) {
      updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart));
    } else if (visibleTimeEnd > maxTime) {
      updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime);
    } else {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }
  }

  render() {
    const {
      groups, items, defaultTimeStart, defaultTimeEnd,
    } = this.state;

    return (
      <Timeline
        groups={groups}
        items={items}
        keys={keys}
        sidebarWidth={150}
        sidebarContent={<div>Above The Left</div>}
        canMove
        canResize="right"
        canSelect
        itemTouchSendsClick={false}
        clusterSettings={{
          tinyItemSize: 0.4,
          clusteringRange: 0.5,
          sequencialClusterTinyItemsOnly: true,
          disableClusteringBelowTime: SIXTEEN_HOURS_IN_MS,
          zoomThrottle: 75,
        }}
        itemSorted
        itemRendererCluster={clusterItemRenderer}
        itemHeightRatio={0.75}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        onCanvasClick={this.handleCanvasClick}
        onCanvasContextMenu={this.handleCanvasContextMenu}
        onItemClick={this.handleItemClick}
        onItemSelect={this.handleItemSelect}
        onItemContextMenu={this.handleItemContextMenu}
        onItemMove={this.handleItemMove}
        onItemDoubleClick={this.handleItemDoubleClick}
        onTimeChange={this.handleTimeChange}
        moveResizeValidator={this.moveResizeValidator}
      />
    );
  }
}
