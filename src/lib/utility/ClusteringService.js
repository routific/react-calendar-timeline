// Eslint is detecting private methods as the a duplicate. Disabling until we upgrade to >8 eslint.
/* eslint-disable no-dupe-class-members */

import PropTypes from 'prop-types';
import Cluster from './Cluster';

// Curent version will just support arrays and after PR review I will add support for immutable.js (Objects)
export default class ClusteringService {
    #items;

    #timeRange;

    #tinyItemSize;

    #clusteringRange;

    #itemsWithClustering = [];

    #groupNumber;

    #currentItemIndex = 0;

    #sequencialClusterTinyItemsOnly;

    static propTypes = {
      items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
      timeRange: PropTypes.number.isRequired,
      tinyItemSize: PropTypes.number.isRequired,
      clusteringRange: PropTypes.number.isRequired,
      groupNumber: PropTypes.number.isRequired,
      sequencialClusterTinyItemsOnly: PropTypes.bool,
    }

    constructor(items, timeRange, { tinyItemSize = 0.4, clusteringRange = 2.2, sequencialClusterTinyItemsOnly = true }, groupNumber) {
      if (!items || !timeRange || !tinyItemSize || !clusteringRange) {
        throw new Error('Missing Clusterings Settings');
      }
      this.#items = items;
      this.#timeRange = timeRange;
      this.#tinyItemSize = tinyItemSize;
      this.#clusteringRange = clusteringRange;
      this.#groupNumber = groupNumber;
      this.#sequencialClusterTinyItemsOnly = sequencialClusterTinyItemsOnly;
    }

    #isTinyItem(item) {
      let returnValue = 0;
      if (item.start !== undefined && item.end !== undefined) {
        returnValue = (item.end - item.start) || 0;
      }
      return (returnValue / this.#timeRange) * 100 <= this.#tinyItemSize;
    }

    #getItemAtIndex(index) {
      if (index > this.#items.length || index < 0) {
        return undefined;
      }
      return this.#items[index];
    }

    #isWithinClusteringRange(distance) {
      return (distance / this.#timeRange) * 100 <= this.#clusteringRange;
    }

    #getNearestItemWithinClusteringRange(currentItem, leftItem, rightItem) {
      if (leftItem && leftItem.canCluster && rightItem && rightItem.canCluster) {
        const leftDistance = currentItem.start - leftItem.end;
        const rightDistance = rightItem.start - currentItem.end;

        if (leftDistance <= rightDistance && this.#isWithinClusteringRange(leftDistance)) {
          return leftItem;
        }
        if (this.#isWithinClusteringRange(rightDistance)) {
          return rightItem;
        }
      } else if (leftItem && leftItem.canCluster && this.#isWithinClusteringRange(currentItem.start - leftItem.end)) {
        return leftItem;
      } else if (rightItem && rightItem.canCluster && this.#isWithinClusteringRange(rightItem.start - currentItem.end)) {
        return rightItem;
      }
      return undefined;
    }


    #findSequencialClusters(cluster) {
      let sequencialClusterFound = true;
      do {
        const item = this.#items[this.#currentItemIndex];
        const nextItem = this.#items[this.#currentItemIndex + 1];

        if (nextItem && nextItem.start) {
          sequencialClusterFound = this.#isWithinClusteringRange(nextItem.start - item.end) && this.#isTinyItem(nextItem);

          if (sequencialClusterFound) {
            cluster.add(nextItem);
            this.#currentItemIndex += 1;
          }
        } else {
          sequencialClusterFound = false;
        }
      } while (sequencialClusterFound && this.#currentItemIndex < this.#items.length);
    }

    #startClustering(nearestItem, currentItem, leftItem, rightItem) {
      const cluster = new Cluster(this.#groupNumber);

      cluster.setStart(currentItem.start);


      if (leftItem === nearestItem) {
        cluster.setStart(leftItem.start);
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

    cluster() {
      const currentItems = this.#items;

      while (this.#currentItemIndex < currentItems.length) {
        const currentItem = currentItems[this.#currentItemIndex];

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

    get items() {
      return this.#itemsWithClustering;
    }
}
