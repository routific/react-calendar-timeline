import PropTypes from 'prop-types';
import React, { PureComponent, Component } from 'react';
import Item from './Item';
import { TimelineStateConsumer } from '../timeline/TimelineStateContext';
import { ItemsConsumer } from './ItemsContext';
import { _get, arraysEqual } from '../utility/generic';
import {
  getItemRenderWindow,
  isItemInRenderWindow,
} from '../utility/calendar';

const canResizeLeft = (item, canResize) => {
  const value = _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize;
  return value === 'left' || value === 'both';
};

const canResizeRight = (item, canResize) => {
  const value = _get(item, 'canResize') !== undefined ? _get(item, 'canResize') : canResize;
  return value === 'right' || value === 'both' || value === true;
};

export class Items extends Component {
  static propTypes = {
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,

    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    visibleTimeEnd: PropTypes.number.isRequired,
    visibleTimeStart: PropTypes.number.isRequired,
    timelineWidth: PropTypes.number.isRequired,

    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    selectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    canChangeGroup: PropTypes.bool.isRequired,
    canMove: PropTypes.bool.isRequired,
    canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
    canSelect: PropTypes.bool,

    keys: PropTypes.object.isRequired,

    moveResizeValidator: PropTypes.func,
    itemSelect: PropTypes.func,
    itemDrag: PropTypes.func,
    itemDrop: PropTypes.func,
    itemResizing: PropTypes.func,
    itemResized: PropTypes.func,

    onItemDoubleClick: PropTypes.func,
    onItemContextMenu: PropTypes.func,

    itemRenderer: PropTypes.func,
    itemRendererCluster: PropTypes.func,
    selected: PropTypes.array,

    groupDimensions: PropTypes.object,
    useResizeHandle: PropTypes.bool,
    scrollRef: PropTypes.object,
    order: PropTypes.object,

    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onResizeStart: PropTypes.func.isRequired,
    dragging: PropTypes.bool.isRequired,
    dragOffset: PropTypes.number.isRequired,
    interactingItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    resizeEdge: PropTypes.oneOf(['right', 'left']),
    /**
     * Fraction of visible duration buffered on each side for React item mounts.
     * Layout still uses the 3× canvas; this only skips mounting off-window items.
     */
    itemRenderBuffer: PropTypes.number,
    itemRenderCull: PropTypes.bool,
  }

  static defaultProps = {
    selected: [],
    itemRenderBuffer: 0.5,
    itemRenderCull: true,
  }

  shouldComponentUpdate(nextProps) {
    return !(
      arraysEqual(nextProps.items, this.props.items)
      && nextProps.groupDimensions === this.props.groupDimensions
      && nextProps.keys === this.props.keys
      && nextProps.canvasTimeStart === this.props.canvasTimeStart
      && nextProps.canvasTimeEnd === this.props.canvasTimeEnd
      && nextProps.canvasWidth === this.props.canvasWidth
      && nextProps.visibleTimeStart === this.props.visibleTimeStart
      && nextProps.visibleTimeEnd === this.props.visibleTimeEnd
      && nextProps.itemRenderBuffer === this.props.itemRenderBuffer
      && nextProps.itemRenderCull === this.props.itemRenderCull
      && nextProps.selectedItem === this.props.selectedItem
      && arraysEqual(nextProps.selected || [], this.props.selected || [])
      && nextProps.dragSnap === this.props.dragSnap
      && nextProps.minResizeWidth === this.props.minResizeWidth
      && nextProps.canChangeGroup === this.props.canChangeGroup
      && nextProps.canMove === this.props.canMove
      && nextProps.canResize === this.props.canResize
      && nextProps.canSelect === this.props.canSelect
      && nextProps.dragging === this.props.dragging
      && nextProps.resizing === this.props.resizing
      && nextProps.resizeEdge === this.props.resizeEdge
      && nextProps.interactingItemId === this.props.interactingItemId
    );
  }

  isSelected(item, itemIdKey) {
    if (!this.props.selected) {
      return this.props.selectedItem === _get(item, itemIdKey);
    }
    const target = _get(item, itemIdKey);
    return this.props.selected.includes(target);
  }

  isInteractingItem = (item) => this.props.interactingItemId === _get(item, this.props.keys.itemIdKey)

  shouldMountItem(item, isInteractingItem, renderTimeStart, renderTimeEnd) {
    if (!this.props.itemRenderCull) {
      return true;
    }
    if (isInteractingItem) {
      return true;
    }
    return isItemInRenderWindow(
      item,
      this.props.keys,
      renderTimeStart,
      renderTimeEnd,
    );
  }

  render() {
    const {
      keys,
      groupDimensions,
      order,
      items,
      visibleTimeStart,
      visibleTimeEnd,
      itemRenderBuffer,
    } = this.props;
    const { itemIdKey } = keys;
    const { renderTimeStart, renderTimeEnd } = getItemRenderWindow(
      visibleTimeStart,
      visibleTimeEnd,
      itemRenderBuffer,
    );

    return (
      <div className="rct-items">
        {items.map((item, i) => {
          const isInteractingItem = this.isInteractingItem(item);
          if (!this.shouldMountItem(
            item,
            isInteractingItem,
            renderTimeStart,
            renderTimeEnd,
          )) {
            return null;
          }

          const itemDimension = groupDimensions.itemDimensions[i];
          if (!itemDimension) {
            return null;
          }

          return (
          <Item
            key={_get(item, itemIdKey)}
            item={item}
            keys={this.props.keys}
            order={order}
            dimensions={itemDimension.dimensions}
            selected={this.isSelected(item, itemIdKey)}
            canChangeGroup={
              _get(item, 'canChangeGroup') !== undefined
                ? _get(item, 'canChangeGroup')
                : this.props.canChangeGroup
            }
            canMove={
              _get(item, 'canMove') !== undefined
                ? _get(item, 'canMove')
                : this.props.canMove
            }
            canResizeLeft={canResizeLeft(item, this.props.canResize)}
            canResizeRight={canResizeRight(item, this.props.canResize)}
            canSelect={
              _get(item, 'canSelect') !== undefined
                ? _get(item, 'canSelect')
                : this.props.canSelect
            }
            useResizeHandle={this.props.useResizeHandle}
            canvasTimeStart={this.props.canvasTimeStart}
            canvasTimeEnd={this.props.canvasTimeEnd}
            canvasWidth={this.props.canvasWidth}
            clusterSettings={this.props.clusterSettings}
            dragSnap={this.props.dragSnap}
            minResizeWidth={this.props.minResizeWidth}
            onResizing={this.props.itemResizing}
            onResized={this.props.itemResized}
            moveResizeValidator={this.props.moveResizeValidator}
            onDrag={this.props.itemDrag}
            onDrop={this.props.itemDrop}
            onItemDoubleClick={this.props.onItemDoubleClick}
            onContextMenu={this.props.onItemContextMenu}
            onSelect={this.props.itemSelect}
            itemRenderer={this.props.itemRenderer}
            itemRendererCluster={this.props.itemRendererCluster}
            scrollRef={this.props.scrollRef}
            dragging={isInteractingItem && this.props.dragging}
            resizing={isInteractingItem && this.props.resizing}
            dragOffset={isInteractingItem ? this.props.dragOffset : 0}
            resizeEdge={isInteractingItem ? this.props.resizeEdge : undefined}
            onDragStart={this.props.onDragStart}
            onDragEnd={this.props.onDragEnd}
            onResizeStart={this.props.onResizeStart}
            visibleTimeEnd={this.props.visibleTimeEnd}
            visibleTimeStart={this.props.visibleTimeStart}
            timelineWidth={this.props.timelineWidth}
          />
          );
        })}
      </div>
    );
  }
}

class ItemsWrapper extends PureComponent {
  render() {
    return (
      <TimelineStateConsumer>
        {({ getTimelineState }) => {
          const {
            canvasTimeStart,
            canvasTimeEnd,
            canvasWidth,
            visibleTimeEnd,
            visibleTimeStart,
            timelineWidth,
            keys,
          } = getTimelineState();
          return (
            <ItemsConsumer>
              {props => (
                <Items
                  canvasTimeStart={canvasTimeStart}
                  canvasTimeEnd={canvasTimeEnd}
                  canvasWidth={canvasWidth}
                  visibleTimeEnd={visibleTimeEnd}
                  visibleTimeStart={visibleTimeStart}
                  timelineWidth={timelineWidth}
                  keys={keys}
                  {...props}
                />
              )}
            </ItemsConsumer>
          );
        }}
      </TimelineStateConsumer>
    );
  }
}

export default ItemsWrapper;
