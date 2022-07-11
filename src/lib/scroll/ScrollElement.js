import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getParentPosition } from '../utility/dom-helpers';

class ScrollElement extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    // traditionalZoom: PropTypes.bool.isRequired,
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
  }

  /**
   * needed to handle scrolling with trackpad
   */
  handleScroll = () => {
    const scrollX = this.scrollComponent.scrollLeft;
    this.props.onScroll(scrollX);
  }

  refHandler = el => {
    this.scrollComponent = el;
    this.props.scrollRef(el);
    if (el) {
      el.addEventListener('wheel', this.handleWheel, { passive: false });
    }
  }


  handleWheel = e => {
    // const { traditionalZoom } = this.props

    // zoom in the time dimension
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const parentPosition = getParentPosition(e.currentTarget);
      const xPosition = e.clientX - parentPosition.x;

      const speed = e.ctrlKey ? 10 : e.metaKey ? 3 : 1;

      // convert vertical zoom to horiziontal
      this.props.onWheelZoom(speed, xPosition, e.deltaY);
    } else if (e.shiftKey) {
      e.preventDefault();
      // shift+scroll event from a touchpad has deltaY property populated; shift+scroll event from a mouse has deltaX
      this.props.onScroll(this.scrollComponent.scrollLeft + (e.deltaY || e.deltaX));
      // no modifier pressed? we prevented the default event, so scroll or zoom as needed
    } else {
      // Trackpad Support for scrolling.
      const scrollX = this.scrollComponent.scrollLeft;
      this.props.onScroll(scrollX + e.deltaX);
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
    // this.props.onMouseMove(e)
    // why is interacting with item important?
    if (this.state.isDragging && !this.props.isInteractingWithItem) {
      this.props.onScroll(this.scrollComponent.scrollLeft + this.dragLastPosition - e.pageX);
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
    // this.props.onMouseLeave(e)
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
        this.props.onScroll(this.scrollComponent.scrollLeft - deltaX);
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
    if (this.scrollComponent) {
      this.scrollComponent.removeEventListener('wheel', this.handleWheel);
    }
  }

  render() {
    const { width, height, children } = this.props;
    const { isDragging } = this.state;

    const scrollComponentStyle = {
      width: `${width}px`,
      height: `${height + 20}px`, // 20px to push the scroll element down off screen...?
      cursor: isDragging ? 'move' : 'default',
      position: 'relative',
      overflow: 'hidden', // required for trackpad support
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
        onWheel={this.handleWheel}
      >
        {children}
      </div>

    );
  }
}

export default ScrollElement;
