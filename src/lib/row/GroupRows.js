import PropTypes from 'prop-types'
import React, { Component } from 'react'
import GroupRow from './GroupRow'

export default class GroupRows extends Component {
  static propTypes = {
    canvasWidth: PropTypes.number.isRequired,
    lineCount: PropTypes.number.isRequired,
    groupHeights: PropTypes.array.isRequired,
    onRowClick: PropTypes.func.isRequired,
    onRowEnter: PropTypes.func,
    onRowLeave: PropTypes.func,
    onRowDoubleClick: PropTypes.func.isRequired,
    clickTolerance: PropTypes.number.isRequired,
    groups: PropTypes.array.isRequired,
    horizontalLineClassNamesForGroup: PropTypes.func,
    onRowContextClick: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return !(
      nextProps.canvasWidth === this.props.canvasWidth &&
      nextProps.lineCount === this.props.lineCount &&
      nextProps.groupHeights === this.props.groupHeights &&
      nextProps.groups === this.props.groups
    )
  }

  render() {
    const {
      canvasWidth,
      lineCount,
      groupHeights,
      onRowClick,
      onRowEnter,
      onRowLeave,
      onRowDoubleClick,
      clickTolerance,
      groups,
      horizontalLineClassNamesForGroup,
      onRowContextClick,
    } = this.props
    let lines = []

    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <GroupRow
          clickTolerance={clickTolerance}
          onContextMenu={evt => onRowContextClick(evt, i)}
          onClick={evt => onRowClick(evt, i)}
          onRowEnter={evt => onRowEnter(evt, i)}
          onRowLeave={evt => onRowLeave(evt, i)}
          onDoubleClick={evt => onRowDoubleClick(evt, i)}
          key={`horizontal-line-${i}`}
          isEvenRow={i % 2 === 0}
          group={groups[i]}
          horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
          style={{
            width: `${canvasWidth}px`,
            height: `${groupHeights[i]}px`
          }}
        />
      )
    }

    return <div className="rct-horizontal-lines">{lines}</div>
  }
}
