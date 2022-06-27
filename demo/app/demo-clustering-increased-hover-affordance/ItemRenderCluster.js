import React from 'react';
import ItemCluster from './ItemCluster';

const ItemRenderCluster = ({
  item,
  itemContext,
  getItemProps,
  getTinyItemBufferProps,
}) => <ItemCluster item={item} itemContext={itemContext} getItemProps={getItemProps} getTinyItemBufferProps={getTinyItemBufferProps}/>;
export default ItemRenderCluster;
