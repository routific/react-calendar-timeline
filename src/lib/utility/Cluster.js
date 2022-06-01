export default class Cluster {
    #items = [];

    #group;

    #startTime;

    constructor(group) {
      this.#group = group;
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

    get itemsInCluster() {
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
          start: this.#startTime,
          end: items[items.length - 1].end,
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
