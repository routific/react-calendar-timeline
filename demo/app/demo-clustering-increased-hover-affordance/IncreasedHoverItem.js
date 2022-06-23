import React from 'react';

const IncreasedHoverItem = (props) => {
  if (props.isTinyItem) {
    return (
      <div {...props.tinyItemBufferProps} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}>
      {props.children}
      </div>
    );
  }
  return <>{props.children}</>;
};

export default IncreasedHoverItem;
