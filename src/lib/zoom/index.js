import React from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const iconProps = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function DragIcon({ className }) {
  return (
    <svg className={className} {...iconProps}>
      <circle cx="9" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

DragIcon.propTypes = {
  className: PropTypes.string,
}

function ZoomInIcon({ className }) {
  return (
    <svg className={className} {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M11 8v6M8 11h6" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

ZoomInIcon.propTypes = {
  className: PropTypes.string,
}

function ZoomOutIcon({ className }) {
  return (
    <svg className={className} {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M8 11h6" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

ZoomOutIcon.propTypes = {
  className: PropTypes.string,
}

function ResetIcon({ className }) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  )
}

ResetIcon.propTypes = {
  className: PropTypes.string,
}

const StyledZoomControl = styled.div`
  position: absolute;
  width: 25px;
  z-index: 999;
  top: 75px;
  right: 1%;
  opacity: 0.3;
  background: #bbb;
  :hover {
    opacity: 1;
  }
`

const StyledDragControl = styled.div`
  height: 20px;
  cursor: grab;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    color: blue;
  }
  :active {
    cursor: grabbing;
  }
`

const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ButtonContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  :hover {
    color: blue;
  }
  :active {
    color: darkblue;
  }
`

const ZoomControl = ({ onZoomIn, onZoomOut, onZoomReset }) => (
  <Draggable handle="#handle">
    <StyledZoomControl className="zoom-control" data-testid="zoom-control">
      <StyledDragControl id="handle">
        <DragIcon className="zoom-drag-icon" />
      </StyledDragControl>
      <StyledButtons>
        <ButtonContainer data-testid="zoom-in" onClick={() => onZoomIn()}>
          <ZoomInIcon className="zoom-in-icon" />
        </ButtonContainer>
        <ButtonContainer data-testid="zoom-out" onClick={() => onZoomOut()}>
          <ZoomOutIcon className="zoom-out-icon" />
        </ButtonContainer>
        <ButtonContainer data-testid="zoom-reset" onClick={() => onZoomReset()}>
          <ResetIcon className="zoom-reset-icon" />
        </ButtonContainer>
      </StyledButtons>
    </StyledZoomControl>
  </Draggable>
)

ZoomControl.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomReset: PropTypes.func.isRequired,
}

export default ZoomControl
