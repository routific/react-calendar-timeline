import React from 'react';
import moment from 'moment';
import styled from 'styled-components';

const StyledZoom = styled.div`
  display:flex;
  flex-direction:row-reverse;
    width:100%;
  position: relative;
  z-index:999;
`;

const defaultTimeStart = moment('2022-MAY-12')
  .startOf('day')
  .toDate();

const defaultTimeEnd = moment('2022-MAY-12')
  .endOf('day')
  .toDate();
/*
* @param onZoomIn:      a function that zooms in the canvas by a scale of 30%. To change this value, pass in {value:x} where x is a percent of the current
                        view that you would like to scale.
* @param onZoomOut:     a function that zooms out the canvas by a scale of 30%.
* @param onZoomReset:   a function that sets the timeline to a specific left and right time. By default, it will reset to the defaultStart/EndTime
*                       || visibleStartTime that you passed into the library. If you wish the reset to be something other than this, you can pass
                        in {canvasTimeStart: x, canvasTimeEnd: x} into the onZoomReset to set it to a specific time range.
*/
const ZoomRenderer = ({ onZoomIn, onZoomOut, onZoomReset }) => (
  <StyledZoom>
    <button onClick={() => onZoomIn({ value: (1 * 0.5) })}>Zoom In</button>
    <button onClick={() => onZoomOut({ value: (1 / 0.5) })}>Zoom Out</button>
    <button onClick={() => onZoomReset({ canvasTimeStartZoom: defaultTimeStart, canvasTimeEndZoom: defaultTimeEnd })}>Reset Zoom</button>
  </StyledZoom>
);

export default ZoomRenderer;
