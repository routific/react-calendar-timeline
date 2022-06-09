import { _get } from './generic';

export default class Cluster {
    #items = [];

    #group;

    #startTime;

    #startTimeKey;

    #endTimeKey;

    constructor(group, startTimeKey, endTimeKey) {
      this.#group = group;
      this.#startTimeKey = startTimeKey;
      this.#endTimeKey = endTimeKey;
    }

    add(item) {
      this.#items.push(item);
    }

    setStart(startTime) {
      this.#startTime = startTime;
    }

    get length() {
      return this.#items.length;
    }

    get startTime() {
      return this.#startTime();
    }

    get items() {
      return this.#items;
    }

    #clusterHasRequiredFields() {
      if (!this.#items) {
        throw new Error('Please add items to your cluster');
      }
      if (!this.#group) {
        throw new Error('Please add a group number to your cluster in the constructor');
      }
      if (!this.#startTime) {
        throw new Error('Please provide a start time for your cluster, End times will be automatically calculated.');
      }
      return true;
    }

    get toObject() {
      const items = this.#items;

      if (this.#clusterHasRequiredFields()) {
        return {
          id: `Cluster ${this.#group}-${items[0].id}-${items[items.length - 1].id}`,
          group: this.#group,
          title: `Cluster of ${items.length} items`,
          [this.#startTimeKey]: this.#startTime,
          [this.#endTimeKey]: _get(items[items.length - 1], this.#endTimeKey),
          canMove: false,
          canResize: false,
          isCluster: true,
          className: 'cluster',
          items,
        };
      }
      return undefined;
    }
}
