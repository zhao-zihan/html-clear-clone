"use strict";

class Collection {
  constructor(data) {
    console.log("data in collection constructor" + data);
    this._init(data);
    // this._render();
    // this._populateItems();
  }

  _init(data) {
    this.initiated = false;

    this.data = data || mock.data;
    console.log("init in collection " + this.data);
    this.items = [];
  }

  _populateItems() {
    console.log("populate in collection " + this.data.items);
    const items = this.data.items;
    let i = items.length;
    console.log("there are " + i + " i");

    this.count = 0;
    this.hash = {};
    this.newIdFrom = i;

    while (i--) {
      this._addItem(items[i]);
      console.log("items[i] is " + items[i]);
    }

    this.hasDoneItems = this.items.length > this.count;
  }

  _addItem(data) {
    const newItem = this.itemType(data);
    console.log("newItem: " + JSON.stringify(newItem));

    newItem.collection = this;
    // newItem.updatePosition();

    newItem.el.dataset.id = this.newIdFrom;
    // this.el.insertAdjacentHTML("afterend", newItem);
    // console.log("current el: " + this.el.innerHTML);

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
