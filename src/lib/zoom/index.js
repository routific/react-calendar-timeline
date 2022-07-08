import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ZoomInOutlined, ZoomOutOutlined, RetweetOutlined, DragOutlined,
} from '@ant-design/icons';

const StyledZoomControl = styled.div`
    position: absolute;
    background:'red';
    width:25px;
    z-index:999;
    top:75px;
    right: 1%;
    opacity: .3;
    background: #bbb;
    :hover {
      opacity: 1;
    }
`;

const StyledDragControl = styled.div`
  height: 20px;
  cursor: grab;
  text-align: center;
  :hover {
    color: blue;
  }
  :active {
    cursor: grabbing;
  }
`;

const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ButtonContainer = styled.div`
  cursor: pointer;
  :hover {
    color: blue;
  }
  :active {
    color:darkblue;
  }
`;

const ZoomControl = ({ onZoomIn, onZoomOut, onZoomReset }) => (
  <Draggable handle="#handle" >
  <StyledZoomControl className='zoom-control' data-testid="zoom-control">
    <StyledDragControl id="handle" >
      <DragOutlined className="zoom-drag-icon"/>
    </StyledDragControl>
    <StyledButtons>
      <ButtonContainer data-testid="zoom-in" onClick={() => onZoomIn()}>
        <ZoomInOutlined className="zoom-in-icon"/>
      </ButtonContainer>
      <ButtonContainer data-testid="zoom-out" onClick={() => onZoomOut()}>
        <ZoomOutOutlined className="zoom-out-icon"/>
      </ButtonContainer>
      <ButtonContainer data-testid="zoom-reset" onClick={() => onZoomReset()}>
        <RetweetOutlined className="zoom-reset-icon"/>
      </ButtonContainer>
    </StyledButtons>
  </StyledZoomControl>
  </Draggable>
);

ZoomControl.propTypes = {
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomReset: PropTypes.func.isRequired,
};

export default ZoomControl;
