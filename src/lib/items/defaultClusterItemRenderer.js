import React from 'react';
import PropTypes from 'prop-types';

const defaultClusterItemRenderer = ({
  item,
  itemContext,
  getItemProps,
  _, // getResizeProps, **Currently not supporting resizing clusters
}) => (
    <div {...getItemProps(item.itemProps)}>
      <div
        className="rct-item-content"
        style={{ maxHeight: `${itemContext.dimensions.height}` }}
      >
        {itemContext.title}
      </div>
    </div>
);

// TODO: update this to actual prop types. Too much to change before release
// future me, forgive me.
defaultClusterItemRenderer.propTypes = {
  item: PropTypes.any,
  itemContext: PropTypes.any,
  getItemProps: PropTypes.any,
  getResizeProps: PropTypes.any,
};

export default defaultClusterItemRenderer;
