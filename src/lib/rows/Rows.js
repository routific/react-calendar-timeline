import React from 'react';
import interact from 'interactjs';
import { _get } from '../utility/generic';
import { getRowSegments } from '../utility/rowWindow';
import { ItemsContextProvider } from '../items/ItemsContext';
import { GroupRowContextProvider } from './GroupRowContext';
import { LayerContextProvider, LayerConsumer } from './LayerContext';

class Rows extends React.PureComponent {
  initState = {
    dragging: false,
    resizing: false,
    dragOffset: 0,
    interactingItemId: undefined,
  }

  state = this.initState

  handleDragStart = (dragging, dragOffset, itemId) => {
    if (this.props.rowWindowing) {
      // Rows mount and unmount while the user scrolls during a drag, so interact.js has to
      // re-collect its dropzones on every move instead of only at drag start.
      this.previousDynamicDrop = interact.dynamicDrop();
      interact.dynamicDrop(true);
    }
    this.setState({
      dragging,
      dragOffset,
      interactingItemId: itemId,
    });
  }

  clearState = () => {
    if (this.previousDynamicDrop !== undefined) {
      interact.dynamicDrop(this.previousDynamicDrop);
      this.previousDynamicDrop = undefined;
    }
    this.setState(this.initState);
  }

  handleResizeEnd = (itemId, resizeTime, resizeEdge, timeDelta) => {
    this.props.itemResized(itemId, resizeTime, resizeEdge, timeDelta);
    this.clearState();
  }

  handleDragEnd = () => {
    this.clearState();
  }

  handleResizeStart = (resizing, itemId) => {
    this.setState({
      resizing,
      interactingItemId: itemId,
    });
  }

  getLayerRootProps = () => ({
    style: {
      // height: '100%'
    },
  })

  renderGroup(i) {
    const {
      groups,
      groupHeights,
      itemRenderer,
      itemRendererCluster,
      clusterSettings,
      canChangeGroup,
      canMove,
      canResize,
      canSelect,
      useResizeHandle,
      dragSnap,
      minResizeWidth,
      itemResizing,
      moveResizeValidator,
      itemDrag,
      itemDrop,
      onItemDoubleClick,
      onItemContextMenu,
      itemSelect,
      scrollRef,
      selected,
      selectedItem,
      rowRenderer: Layers,
      rowData,
      groupsWithItemsDimensions,
      // row props
      clickTolerance,
      onRowClick,
      onRowDoubleClick,
      horizontalLineClassNamesForGroup,
      onRowContextClick,
      keys,
      resizeEdge,
      itemRenderBuffer,
      itemRenderCull,
    } = this.props;
    const groupHeight = groupHeights[i];
    const groupId = _get(groups[i], keys.groupIdKey);
    const group = groupsWithItemsDimensions[groupId];
    return (
      <Group
        key={`horizontal-line-${groupId}`}
        clickTolerance={clickTolerance}
        onRowContextClick={onRowContextClick}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        index={i}
        groups={groups}
        horizontalLineClassNamesForGroup={
          horizontalLineClassNamesForGroup
        }
        groupHeight={groupHeight}
        group={group}
        dragSnap={dragSnap}
        minResizeWidth={minResizeWidth}
        selectedItem={selectedItem}
        canChangeGroup={canChangeGroup}
        canMove={canMove}
        canResize={canResize}
        canSelect={canSelect}
        moveResizeValidator={moveResizeValidator}
        itemSelect={itemSelect}
        itemDrag={itemDrag}
        itemDrop={itemDrop}
        itemResizing={itemResizing}
        onItemDoubleClick={onItemDoubleClick}
        onItemContextMenu={onItemContextMenu}
        itemRenderer={itemRenderer}
        itemRendererCluster={itemRendererCluster}
        clusterSettings={clusterSettings}
        selected={selected}
        useResizeHandle={useResizeHandle}
        scrollRef={scrollRef}
        resizeEdge={resizeEdge}
        Layers={Layers}
        rowData={rowData}
        itemResized={this.handleResizeEnd}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        onResizeStart={this.handleResizeStart}
        dragging={this.state.dragging}
        resizing={this.state.resizing}
        dragOffset={this.state.dragOffset}
        interactingItemId={this.state.interactingItemId}
        itemRenderBuffer={itemRenderBuffer}
        itemRenderCull={itemRenderCull}
      />
    );
  }

  renderWindowedGroups() {
    const {
      groups, keys, groupTops, groupHeights, renderedGroupIndices,
    } = this.props;
    const rows = [];
    getRowSegments(renderedGroupIndices, groupTops, groupHeights).forEach(({ index, spacerBefore }) => {
      if (spacerBefore > 0) {
        rows.push(
          <div
            key={`row-spacer-${_get(groups[index], keys.groupIdKey)}`}
            className="rct-row-spacer"
            aria-hidden="true"
            style={{ height: spacerBefore }}
          />,
        );
      }
      rows.push(this.renderGroup(index));
    });
    return rows;
  }

  render() {
    const { groupHeights, items, renderedGroupIndices } = this.props;
    return (
      <LayerContextProvider
        itemsWithInteractions={items}
        getLayerRootProps={this.getLayerRootProps}
      >
        <div className="rct-horizontal-lines">
          {renderedGroupIndices
            ? this.renderWindowedGroups()
            : groupHeights.map((groupHeight, i) => this.renderGroup(i))}
        </div>
      </LayerContextProvider>
    );
  }
}

class Group extends React.PureComponent {
  render() {
    const {
      clickTolerance,
      onRowContextClick,
      onRowClick,
      onRowDoubleClick,
      index,
      groups,
      horizontalLineClassNamesForGroup,
      groupHeight,
      group,
      dragSnap,
      minResizeWidth,
      selectedItem,
      canChangeGroup,
      canMove,
      canResize,
      canSelect,
      moveResizeValidator,
      itemSelect,
      itemDrag,
      itemDrop,
      itemResizing,
      onItemDoubleClick,
      onItemContextMenu,
      itemRenderer,
      itemRendererCluster,
      clusterSettings,
      selected,
      useResizeHandle,
      scrollRef,
      resizeEdge,
      Layers,
      rowData,
      itemResized,
      onDragStart,
      onDragEnd,
      onResizeStart,
      dragging,
      resizing,
      dragOffset,
      interactingItemId,
      itemRenderBuffer,
      itemRenderCull,
    } = this.props;

    return (
      <GroupRowContextProvider
        clickTolerance={clickTolerance}
        onContextMenu={onRowContextClick}
        onClick={onRowClick}
        onDoubleClick={onRowDoubleClick}
        isEvenRow={index % 2 === 0}
        group={groups[index]}
        horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
        groupHeight={groupHeight}
        groupIndex={index}
      >
        <ItemsContextProvider
          items={group.items}
          groupDimensions={group}
          dragSnap={dragSnap}
          minResizeWidth={minResizeWidth}
          selectedItem={selectedItem}
          canChangeGroup={canChangeGroup}
          canMove={canMove}
          canResize={canResize}
          canSelect={canSelect}
          moveResizeValidator={moveResizeValidator}
          itemSelect={itemSelect}
          itemDrag={itemDrag}
          itemDrop={itemDrop}
          itemResizing={itemResizing}
          itemResized={itemResized}
          onItemDoubleClick={onItemDoubleClick}
          onItemContextMenu={onItemContextMenu}
          itemRenderer={itemRenderer}
          itemRendererCluster={itemRendererCluster}
          clusterSettings={clusterSettings}
          selected={selected}
          useResizeHandle={useResizeHandle}
          scrollRef={scrollRef}
          order={group}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onResizeStart={onResizeStart}
          resizeEdge={resizeEdge}
          dragging={dragging}
          resizing={resizing}
          dragOffset={dragOffset}
          interactingItemId={interactingItemId}
          itemRenderBuffer={itemRenderBuffer}
          itemRenderCull={itemRenderCull}
        >
          <LayerConsumer>
            {({ getLayerRootProps, itemsWithInteractions }) => (
              <Layers
                getLayerRootProps={getLayerRootProps}
                rowData={rowData}
                group={group.group}
                itemsWithInteractions={itemsWithInteractions}
                getRowItems={() => group.items}
              />
            )}
          </LayerConsumer>
        </ItemsContextProvider>
      </GroupRowContextProvider>
    );
  }
}

export default Rows;
