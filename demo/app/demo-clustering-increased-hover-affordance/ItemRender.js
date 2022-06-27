import React from 'react';
import Item from './Item';


const ItemRender = ({
  item,
  itemContext,
  getItemProps,
  getTinyItemBufferProps,
}) => <Item item={item} itemContext={itemContext} getItemProps={getItemProps} getTinyItemBufferProps={getTinyItemBufferProps}/>;
export default ItemRender;
