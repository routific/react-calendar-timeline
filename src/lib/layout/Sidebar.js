import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { _get, arraysEqual } from '../utility/generic';

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
  }

  shouldComponentUpdate(nextProps) {
    return !(
      nextProps.keys === this.props.keys
      && nextProps.width === this.props.width
      && nextProps.height === this.props.height
      && arraysEqual(nextProps.groups, this.props.groups)
      && arraysEqual(nextProps.groupHeights, this.props.groupHeights)
      && nextProps.sidebarRowRef === this.props.sidebarRowRef
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
      width, groupHeights, height, isRightSidebar, sidebarRowRef,
    } = this.props;

    const { groupIdKey, groupTitleKey, groupRightTitleKey } = this.props.keys;

    const sidebarStyle = {
      width: `${width}px`,
      height: `${height}px`,
    };

    const groupsStyle = {
      width: `${width}px`,
    };

    const groupLines = this.props.groups.map((group, index) => {
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
          ref={sidebarRowRef(group.id)}
        >
          {this.renderGroupContent(
            group,
            isRightSidebar,
            groupTitleKey,
            groupRightTitleKey,
          )}
        </div>
      );
    });

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
