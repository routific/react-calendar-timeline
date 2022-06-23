import React, { useState } from 'react';
import IncreasedHoverItem from './IncreasedHoverItem';

const Item = ({
  item, itemContext, getItemProps, getTinyItemBufferProps,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const onMouseEnter = () => {
    setIsHovering(true);
  };

  const onMouseLeave = () => {
    setIsHovering(false);
  };

    // Setting the background color just so you can visually see the hover affordance area.
  const tinyItemBufferProps = getTinyItemBufferProps({
    style: {
      background: isHovering ? 'red' : 'green',
    },
  });

  const itemProps = getItemProps({
    style: {
      color: 'white',
      borderColor: item.color,
      border: 'double 3px',
      height: '200px !important',
      borderRadius: 6,
      borderLeftWidth: itemContext.selected ? 3 : 1,
      borderRightWidth: itemContext.selected ? 3 : 1,
      cursor: itemContext.selected ? 'not-allowed' : '',
      zIndex: isHovering ? 81 : 80,
    },
  });

  if (isHovering) {
    tinyItemBufferProps.style.width = 'auto';
    itemProps.style.width = 'auto';
  }

  return (
    <IncreasedHoverItem isTinyItem={item.isTinyItem} tinyItemBufferProps={tinyItemBufferProps} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
         <div {...itemProps}>
                <div
                title={`${item.id}`}
                style={{
                  height: itemContext.dimensions.height,
                  overflow: 'hidden',
                  paddingLeft: 3,
                  paddingTop: 1,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
                >
                {itemContext.title}
                </div>
            </div>
    </IncreasedHoverItem>
  );
};

export default Item;
