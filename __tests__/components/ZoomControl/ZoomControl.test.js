import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { fireEvent } from 'react-testing-library';
import ZoomControl from 'lib/zoom';
import '@testing-library/jest-dom/extend-expect';
import render from '../../test-utility/renderWithTimelineStateAndHelpers';

describe('Zoom Control', () => {
  it('should render', () => {
    const onZoomIn = jest.fn();


    const holder = document.createElement('div');

    const { getByTestId } = render(
      <ZoomControl
        onZoomIn={() => onZoomIn()}
        onZoomOut={() => onZoomIn()}
        onZoomReset={() => onZoomIn()}
      />,
      {
        container: document.body.appendChild(holder),
      },
    );
    expect(getByTestId('zoom-control')).toBeInTheDocument();
  });

  it('Should call the zoom functions that are passed in when the zoom in/out/reset button is clicked', () => {
    const holder = document.createElement('div');
    const onZoomIn = jest.fn();
    const onZoomOut = jest.fn();
    const onZoomReset = jest.fn();

    const { getByTestId } = render(
      <ZoomControl
        onZoomIn={() => onZoomIn()}
        onZoomOut={() => onZoomOut()}
        onZoomReset={() => onZoomReset()}
      />,
      {
        container: document.body.appendChild(holder),
      },
    );

    expect(getByTestId('zoom-control')).toBeInTheDocument();
    expect(getByTestId('zoom-in')).toBeInTheDocument();
    expect(getByTestId('zoom-out')).toBeInTheDocument();
    expect(getByTestId('zoom-reset')).toBeInTheDocument();

    expect(onZoomIn).toBeCalledTimes(0);
    fireEvent.click(getByTestId('zoom-in'));
    expect(onZoomIn).toBeCalledTimes(1);

    expect(onZoomOut).toBeCalledTimes(0);
    fireEvent.click(getByTestId('zoom-out'));
    expect(onZoomIn).toBeCalledTimes(1);

    expect(onZoomReset).toBeCalledTimes(0);
    fireEvent.click(getByTestId('zoom-reset'));
    expect(onZoomReset).toBeCalledTimes(1);
  });
});
