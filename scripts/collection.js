"use strict";

class Collection {
  constructor() {
    this._init();
    this._render();
    this._populateItems();
  }

  _init(data) {
    this.initiated = false;

    this.data = data || mock.data;
    this.items = [];
  }

  _populateItems() {
    const items = this.data.items;
    const i = items.length;

    this.count = 0;
    this.hash = {};
    this.newIdFrom = i;

    while (i--) {
      this._addItem(items[i]);
    }

    this.hasDoneItems = this.items.length > this.count;
  }

  _addItem(data) {
    const newItem = this.itemType(data);

    newItem.collection = this;
    newItem.updatePosition();

    newItem.el.dataset.id = this.newIdFrom;
    newItem.htmlEl.push(newItem.el);

    this.items.push(newItem);
    this.hash[this.newIdFrom] = newItem;
    this.newIdFrom++;

    if (!newItem.data.done) this.count++;

    if (this.updateCount) {
      this.updateCount();
    }

    return newItem;
  }

  _getItemById(id) {
    return this.hash[id];
  }

  _getItemByOrder(order) {
    const i = this.items.length;
    let item;

    while (i--) {
      item = this.items[i];
      if (item.data.order === order) {
        return item;
      }
    }
  }

  _updateColor() {
    this.items.forEach((item) => item._updateColor());
  }
}
