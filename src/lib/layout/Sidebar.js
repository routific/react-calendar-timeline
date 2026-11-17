import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { _get, arraysEqual } from '../utility/generic';
import { getRowSegments } from '../utility/rowWindow';

export default class Sidebar extends Component {
  static propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    groupHeights: PropTypes.array.isRequired,
    keys: PropTypes.object.isRequired,
    groupRenderer: PropTypes.func,
    isRightSidebar: PropTypes.bool,
    sidebarRowRef: PropTypes.func,
    /** Row indices to render; every row is rendered when not set. */
    renderedGroupIndices: PropTypes.array,
    groupTops: PropTypes.array,
  }

  shouldComponentUpdate(nextProps) {
    return !(
      nextProps.keys === this.props.keys
      && nextProps.width === this.props.width
      && nextProps.height === this.props.height
      && arraysEqual(nextProps.groups, this.props.groups)
      && arraysEqual(nextProps.groupHeights, this.props.groupHeights)
      && nextProps.sidebarRowRef === this.props.sidebarRowRef
      && nextProps.renderedGroupIndices === this.props.renderedGroupIndices
      && (!nextProps.renderedGroupIndices
        || arraysEqual(nextProps.groupTops, this.props.groupTops))
    );
  }

  renderGroupContent(group, isRightSidebar, groupTitleKey, groupRightTitleKey) {
    if (this.props.groupRenderer) {
      return React.createElement(this.props.groupRenderer, {
        group,
        isRightSidebar,
      });
    }
    return _get(group, isRightSidebar ? groupRightTitleKey : groupTitleKey);
  }

  render() {
    const {
      width, groupHeights, height, isRightSidebar, sidebarRowRef, renderedGroupIndices,
    } = this.props;

    const { groupIdKey, groupTitleKey, groupRightTitleKey } = this.props.keys;

    const sidebarStyle = {
      width: `${width}px`,
      height: `${height}px`,
    };

    const groupsStyle = {
      width: `${width}px`,
    };

    const renderGroupLine = (group, index) => {
      const elementStyle = {
        height: `${groupHeights[index]}px`,
        lineHeight: `${groupHeights[index]}px`,
      };

      return (
        <div
          key={_get(group, groupIdKey)}
          className={
            `rct-sidebar-row rct-sidebar-row-${index % 2 === 0 ? 'even' : 'odd'}`
          }
          style={elementStyle}
          ref={sidebarRowRef ? sidebarRowRef(group.id) : undefined}
        >
          {this.renderGroupContent(
            group,
            isRightSidebar,
            groupTitleKey,
            groupRightTitleKey,
          )}
        </div>
      );
    };

    let groupLines;
    if (renderedGroupIndices) {
      const { groups, groupTops } = this.props;
      groupLines = [];
      getRowSegments(renderedGroupIndices, groupTops, groupHeights).forEach(({ index, spacerBefore }) => {
        if (spacerBefore > 0) {
          groupLines.push(
            <div
              key={`row-spacer-${_get(groups[index], groupIdKey)}`}
              className="rct-row-spacer"
              aria-hidden="true"
              style={{ height: `${spacerBefore}px` }}
            />,
          );
        }
        groupLines.push(renderGroupLine(groups[index], index));
      });
    } else {
      groupLines = this.props.groups.map(renderGroupLine);
    }

    return (
      <div
        className={`rct-sidebar${isRightSidebar ? ' rct-sidebar-right' : ''}`}
        style={sidebarStyle}
      >
        <div style={groupsStyle}>{groupLines}</div>
      </div>
    );
  }
}
