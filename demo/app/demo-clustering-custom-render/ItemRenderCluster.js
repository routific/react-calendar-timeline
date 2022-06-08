import React from 'react';

const ItemRenderCluster = ({
  item,
  timelineContext,
  itemContext,
  getItemProps,
  getResizeProps,
}) => (
      <div
        {...getItemProps({
          style: {
            background: itemContext.selected ? 'pink' : 'purple',
            color: 'white',
            borderColor: item.color,
            border: 'double 3px',
            height: '200px !important',
            borderRadius: 24,
            borderLeftWidth: itemContext.selected ? 3 : 1,
            borderRightWidth: itemContext.selected ? 3 : 1,
            cursor: itemContext.selected ? 'not-allowed' : '',
          },
        }) }
      >
        <div
        title={`I have ${item.items.map(clusterItem => `${clusterItem.id}`)}`}
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
);
export default ItemRenderCluster;
