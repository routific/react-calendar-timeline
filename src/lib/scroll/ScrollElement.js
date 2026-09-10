import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getParentPosition } from '../utility/dom-helpers';

class ScrollElement extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    scrollRef: PropTypes.func.isRequired,
    isInteractingWithItem: PropTypes.bool.isRequired,
    onZoom: PropTypes.func.isRequired,
    onWheelZoom: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.state = {
      isDragging: false,
    };
    this.rafId = null;
    this.pendingScrollLeft = null;
  }

  /**
   * Coalesce scroll updates onto a single animation frame (upstream-inspired).
   * Keeps the existing scrollLeft model — no transform rewrite.
   */
  scheduleScroll = (scrollLeft) => {
    this.pendingScrollLeft = scrollLeft;
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        if (this.pendingScrollLeft != null) {
          this.props.onScroll(this.pendingScrollLeft);
          this.pendingScrollLeft = null;
        }
      });
    }
  }

  /**
   * Normalize wheel deltas across browsers/devices (upstream #929 / #975).
   */
  normalizeWheelDelta = (e) => {
    let delta = e.deltaY || e.deltaX;
    if (e.deltaMode === 1) {
      delta *= 15;
    } else if (e.deltaMode === 2) {
      delta *= 800;
    }
    const MAX_DELTA = 120;
    return Math.max(-MAX_DELTA, Math.min(MAX_DELTA, delta));
  }

  handleScroll = () => {
    const scrollX = this.scrollComponent.scrollLeft;
    this.scheduleScroll(scrollX);
  }

  refHandler = el => {
    this.scrollComponent = el;
    this.props.scrollRef(el);
    if (el) {
      el.addEventListener('wheel', this.handleWheel, { passive: false });
    }
  }

  handleWheel = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const parentPosition = getParentPosition(e.currentTarget);
      const xPosition = e.clientX - parentPosition.x;
      const speed = e.ctrlKey ? 10 : e.metaKey ? 3 : 1;
      const normalizedDelta = this.normalizeWheelDelta(e);
      this.props.onWheelZoom(speed, xPosition, normalizedDelta);
    } else if (e.shiftKey) {
      e.preventDefault();
      const normalizedDelta = this.normalizeWheelDelta(e);
      this.scheduleScroll(this.scrollComponent.scrollLeft + normalizedDelta);
    } else {
      const scrollX = this.scrollComponent.scrollLeft;
      this.scheduleScroll(scrollX + e.deltaX);
    }
  }

  handleMouseDown = e => {
    if (e.button === 0) {
      this.dragStartPosition = e.pageX;
      this.dragLastPosition = e.pageX;
      this.setState({
        isDragging: true,
      });
    }
  }

  handleMouseMove = e => {
    if (this.state.isDragging && !this.props.isInteractingWithItem) {
      this.scheduleScroll(this.scrollComponent.scrollLeft + this.dragLastPosition - e.pageX);
      this.dragLastPosition = e.pageX;
    }
  }

  handleMouseUp = () => {
    this.dragStartPosition = null;
    this.dragLastPosition = null;

    this.setState({
      isDragging: false,
    });
  }

  handleMouseLeave = () => {
    this.dragStartPosition = null;
    this.dragLastPosition = null;
    this.setState({
      isDragging: false,
    });
  }

  handleTouchStart = e => {
    if (e.touches.length === 2) {
      e.preventDefault();

      this.lastTouchDistance = Math.abs(
        e.touches[0].screenX - e.touches[1].screenX,
      );
      this.singleTouchStart = null;
      this.lastSingleTouch = null;
    } else if (e.touches.length === 1) {
      e.preventDefault();

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      this.lastTouchDistance = null;
      this.singleTouchStart = { x, y, screenY: window.pageYOffset };
      this.lastSingleTouch = { x, y, screenY: window.pageYOffset };
    }
  }

  handleTouchMove = e => {
    const { isInteractingWithItem, width, onZoom } = this.props;
    if (isInteractingWithItem) {
      e.preventDefault();
      return;
    }
    if (this.lastTouchDistance && e.touches.length === 2) {
      e.preventDefault();
      const touchDistance = Math.abs(e.touches[0].screenX - e.touches[1].screenX);
      const parentPosition = getParentPosition(e.currentTarget);
      const xPosition = (e.touches[0].screenX + e.touches[1].screenX) / 2 - parentPosition.x;
      if (touchDistance !== 0 && this.lastTouchDistance !== 0) {
        onZoom(this.lastTouchDistance / touchDistance, xPosition / width);
        this.lastTouchDistance = touchDistance;
      }
    } else if (this.lastSingleTouch && e.touches.length === 1) {
      e.preventDefault();
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const deltaX = x - this.lastSingleTouch.x;
      const deltaX0 = x - this.singleTouchStart.x;
      const deltaY0 = y - this.singleTouchStart.y;
      this.lastSingleTouch = { x, y };
      const moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0);
      const moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0);
      if (deltaX !== 0 && moveX) {
        this.scheduleScroll(this.scrollComponent.scrollLeft - deltaX);
      }
      if (moveY) {
        window.scrollTo(
          window.pageXOffset,
          this.singleTouchStart.screenY - deltaY0,
        );
      }
    }
  }

  handleTouchEnd = () => {
    if (this.lastTouchDistance) {
      this.lastTouchDistance = null;
    }
    if (this.lastSingleTouch) {
      this.lastSingleTouch = null;
      this.singleTouchStart = null;
    }
  }

  componentWillUnmount() {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollComponent) {
      this.scrollComponent.removeEventListener('wheel', this.handleWheel, { passive: false });
    }
  }

  render() {
    const { width, height, children } = this.props;
    const { isDragging } = this.state;

    const scrollComponentStyle = {
      width: `${width}px`,
      height: `${height + 20}px`,
      cursor: isDragging ? 'move' : 'default',
      position: 'relative',
      overflow: 'hidden',
    };

    return (
      <div
        ref={this.refHandler}
        data-testid="scroll-element"
        className="rct-scroll"
        style={scrollComponentStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        onScroll={this.handleScroll}
      >
        {children}
      </div>

    );
  }
}

export default ScrollElement;
