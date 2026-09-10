import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { noop } from 'test-utility';
import ScrollElement from 'lib/scroll/ScrollElement';

const defaultProps = {
  width: 1000,
  height: 800,
  onZoom: noop,
  onWheelZoom: noop,
  onScroll: noop,
  traditionalZoom: false,
  scrollRef: noop,
  isInteractingWithItem: false,
  onMouseLeave: noop,
  onMouseMove: noop,
  onMouseEnter: noop,
  onContextMenu: noop,
};

const createMouseEvent = pageX => ({
  button: 0,
  pageX,
  preventDefault: noop,
});

// Skipped legacy suite — needs fuller drag/scroll redesign under React 18.
xdescribe('ScrollElement', () => {
  describe('mouse event delegates', () => {
    let onDoubleClickMock;
    let onMouseLeaveMock;
    let onMouseMoveMock;
    let onMouseEnterMock;
    let onContextMenuMock;
    let scrollElement;

    beforeEach(() => {
      onDoubleClickMock = jest.fn();
      onMouseLeaveMock = jest.fn();
      onMouseMoveMock = jest.fn();
      onMouseEnterMock = jest.fn();
      onContextMenuMock = jest.fn();

      const props = {
        ...defaultProps,
        onDoubleClick: onDoubleClickMock,
        onMouseLeave: onMouseLeaveMock,
        onMouseMove: onMouseMoveMock,
        onMouseEnter: onMouseEnterMock,
        onContextMenu: onContextMenuMock,
      };

      const { getByTestId } = render(
        <ScrollElement {...props}>
          <div />
        </ScrollElement>,
      );
      scrollElement = getByTestId('scroll-element');
    });

    it('scroll element onMouseLeave calls passed in onMouseLeave', () => {
      fireEvent.mouseLeave(scrollElement);
      expect(onMouseLeaveMock).toHaveBeenCalledTimes(1);
    });
    it('scroll element onMouseMove calls passed in onMouseMove', () => {
      fireEvent.mouseMove(scrollElement);
      expect(onMouseMoveMock).toHaveBeenCalledTimes(1);
    });
    it('scroll element onMouseEnter calls passed in onMouseEnter', () => {
      fireEvent.mouseEnter(scrollElement);
      expect(onMouseEnterMock).toHaveBeenCalledTimes(1);
    });
    it('scroll element onContextMenu calls passed in onContextMenu', () => {
      fireEvent.contextMenu(scrollElement);
      expect(onContextMenuMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('mouse drag', () => {
    it('scrolls left', () => {
      const { getByTestId } = render(
        <ScrollElement {...defaultProps}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const originX = 100;
      const destinationX = 200;
      const scrollDifference = -(destinationX - originX);

      scrollElement.scrollLeft = originX;

      fireEvent.mouseDown(scrollElement, createMouseEvent(originX));
      fireEvent.mouseMove(scrollElement, createMouseEvent(destinationX));

      expect(scrollElement.scrollLeft).toBe(originX + scrollDifference);
    });

    it('scrolls right', () => {
      const { getByTestId } = render(
        <ScrollElement {...defaultProps}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const originX = 300;
      const destinationX = 100;
      const scrollDifference = -(destinationX - originX);

      scrollElement.scrollLeft = originX;

      fireEvent.mouseDown(scrollElement, createMouseEvent(originX));
      fireEvent.mouseMove(scrollElement, createMouseEvent(destinationX));

      expect(scrollElement.scrollLeft).toBe(originX + scrollDifference);
    });
  });

  describe('mouse leave', () => {
    it('cancels dragging on mouse leave', () => {
      const { getByTestId } = render(
        <ScrollElement {...defaultProps}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const initialScrollLeft = scrollElement.scrollLeft;

      fireEvent.mouseDown(scrollElement, createMouseEvent(100));
      fireEvent.mouseLeave(scrollElement, createMouseEvent(100));
      fireEvent.mouseMove(scrollElement, createMouseEvent(200));

      expect(scrollElement.scrollLeft).toBe(initialScrollLeft);
    });
  });

  describe('scroll', () => {
    it('calls onScroll with current scrollLeft', () => {
      const onScrollMock = jest.fn();
      const { getByTestId } = render(
        <ScrollElement {...defaultProps} onScroll={onScrollMock}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      scrollElement.scrollLeft = 200;

      fireEvent.scroll(scrollElement);

      expect(onScrollMock).toHaveBeenCalledTimes(1);
    });

    it('adds width to scrollLeft if scrollLeft is less than half of width', () => {
      const width = 800;
      const { getByTestId } = render(
        <ScrollElement {...defaultProps} width={width}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const currentScrollLeft = 300;
      scrollElement.scrollLeft = currentScrollLeft;

      fireEvent.scroll(scrollElement);

      expect(scrollElement.scrollLeft).toBe(currentScrollLeft + width);
    });

    it('subtracts width from scrollLeft if scrollLeft is greater than one and a half of width', () => {
      const width = 800;
      const { getByTestId } = render(
        <ScrollElement {...defaultProps} width={width}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const currentScrollLeft = 1300;
      scrollElement.scrollLeft = currentScrollLeft;

      fireEvent.scroll(scrollElement);

      expect(scrollElement.scrollLeft).toBe(currentScrollLeft - width);
    });

    it('does not alter scrollLeft if scrollLeft is between 0.5 and 1.5 of width', () => {
      const width = 800;
      const { getByTestId } = render(
        <ScrollElement {...defaultProps} width={width}>
          <div />
        </ScrollElement>,
      );
      const scrollElement = getByTestId('scroll-element');
      const scrolls = [width * 0.5 + 1, width, width * 1.5 - 1];

      scrolls.forEach(scroll => {
        scrollElement.scrollLeft = scroll;
        fireEvent.scroll(scrollElement);
        expect(scrollElement.scrollLeft).toBe(scroll);
      });
    });
  });
});
