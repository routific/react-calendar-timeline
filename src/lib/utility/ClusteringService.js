// Eslint is detecting private methods as the a duplicate. Disabling until we upgrade to >8 eslint.
/* eslint-disable no-dupe-class-members */

import PropTypes from 'prop-types';
import Cluster from './Cluster';
import {
  isTinyItem, _get, _length, _pop,
} from './generic';

export default class ClusteringService {
    #items;

    #timeRange;

    #tinyItemSize;

    #clusteringRange;

    #itemsWithClustering = [];

    #groupNumber;

    #currentItemIndex = 0;

    #sequencialClusterTinyItemsOnly;

    #startKey;

    #endKey;

    static propTypes = {
      items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
      timeRange: PropTypes.number.isRequired,
      tinyItemSize: PropTypes.number.isRequired,
      clusteringRange: PropTypes.number.isRequired,
      groupNumber: PropTypes.number.isRequired,
      sequencialClusterTinyItemsOnly: PropTypes.bool,
      startKey: PropTypes.string,
      endKey: PropTypes.string,
    }

    constructor(items, timeRange, { tinyItemSize = 0.4, clusteringRange = 2.2, sequencialClusterTinyItemsOnly = true }, groupNumber, startKey, endKey) {
      if (!items || !timeRange || !tinyItemSize || !clusteringRange) {
        throw new Error('Missing Clusterings Settings');
      }

      this.#items = items;
      this.#timeRange = timeRange;
      this.#tinyItemSize = tinyItemSize;
      this.#clusteringRange = clusteringRange;
      this.#groupNumber = groupNumber;
      this.#sequencialClusterTinyItemsOnly = sequencialClusterTinyItemsOnly;
      this.#startKey = startKey;
      this.#endKey = endKey;
    }

    #getItemStart(item) {
      return _get(item, this.#startKey);
    }

    #getItemEnd(item) {
      return _get(item, this.#endKey);
    }

    #isTinyItem(item) {
      return isTinyItem(item, this.#startKey, this.#endKey, this.#timeRange, this.#tinyItemSize);
    }

    #getItemAtIndex(index) {
      if (index > _length(this.#items) || index < 0) {
        return undefined;
      }

      return _get(this.#items, index);
    }

    #isWithinClusteringRange(distance) {
      return (distance / this.#timeRange) * 100 <= this.#clusteringRange;
    }

    #getNearestItemWithinClusteringRange(currentItem, leftItem, rightItem) {
      if (leftItem && leftItem.canCluster && rightItem && rightItem.canCluster) {
        const leftDistance = this.#getItemStart(currentItem) - this.#getItemEnd(leftItem);
        const rightDistance = this.#getItemStart(rightItem) - this.#getItemEnd(currentItem);

        if (leftDistance <= rightDistance && this.#isWithinClusteringRange(leftDistance)) {
          return leftItem;
        }
        if (this.#isWithinClusteringRange(rightDistance)) {
          return rightItem;
        }
      } else if (leftItem && leftItem.canCluster && this.#isWithinClusteringRange(this.#getItemStart(currentItem) - this.#getItemEnd(leftItem))) {
        return leftItem;
      } else if (rightItem && rightItem.canCluster && this.#isWithinClusteringRange(this.#getItemStart(rightItem) - this.#getItemEnd(currentItem))) {
        return rightItem;
      }
      return undefined;
    }

    #findSequencialClusters(cluster) {
      let sequencialClusterFound = true;
      do {
        const item = this.#getItemAtIndex(this.#currentItemIndex);
        const nextItem = this.#getItemAtIndex(this.#currentItemIndex + 1);

        if (nextItem && this.#getItemStart(nextItem) && nextItem.canCluster) {
          sequencialClusterFound = this.#isWithinClusteringRange(this.#getItemStart(nextItem) - this.#getItemEnd(item)) && (this.#sequencialClusterTinyItemsOnly === true ? this.#isTinyItem(nextItem) : true);

          if (sequencialClusterFound) {
            cluster.add(nextItem);
            this.#currentItemIndex += 1;
          }
        } else {
          sequencialClusterFound = false;
        }
      } while (sequencialClusterFound && this.#currentItemIndex < _length(this.#items));
    }

    #startClustering(nearestItem, currentItem, leftItem, rightItem) {
      const cluster = new Cluster(this.#groupNumber, this.#startKey, this.#endKey);

      cluster.setStart(this.#getItemStart(currentItem));

      if (leftItem === nearestItem) {
        _pop(this.#itemsWithClustering);
        cluster.setStart(this.#getItemStart(leftItem));
        cluster.add(leftItem);
        cluster.add(currentItem);
      } else {
        cluster.add(currentItem);
        cluster.add(rightItem);
        this.#currentItemIndex += 1;
      }

      this.#findSequencialClusters(cluster);

      if (cluster.length > 1) {
        this.#itemsWithClustering.push(cluster.toObject);
      } else {
        this.#itemsWithClustering.push(currentItem);
      }
    }

    get items() {
      return this.#itemsWithClustering;
    }

    cluster() {
      const currentItems = this.#items;
      while (this.#currentItemIndex < _length(currentItems)) {
        const currentItem = this.#getItemAtIndex(this.#currentItemIndex);
        if (currentItem.canCluster && this.#isTinyItem(currentItem)) {
          const leftItem = this.#getItemAtIndex(this.#currentItemIndex - 1);
          const rightItem = this.#getItemAtIndex(this.#currentItemIndex + 1);
          const nearestItem = this.#getNearestItemWithinClusteringRange(currentItem, leftItem, rightItem);

          if (nearestItem) {
            this.#startClustering(nearestItem, currentItem, leftItem, rightItem);
          } else {
            this.#itemsWithClustering.push(currentItem);
          }
        } else {
          this.#itemsWithClustering.push(currentItem);
        }
        this.#currentItemIndex += 1;
      }
    }
}
