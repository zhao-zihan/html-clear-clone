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
    // console.log("init in collection " + this.data);
    this.items = [];
  }

  _populateItems() {
    // console.log("populate in collection " + this.data.items);
    const items = this.data.items;
    let i = items.length;
    // console.log("there are " + i + " i");

    this.count = 0;
    this.hash = {};
    this.newIdFrom = i;

    while (i--) {
      this._addItem(items[i]);
      // console.log("items[i] is " + items[i]);
    }

    this.hasDoneItems = this.items.length > this.count;
  }

  _addItem(data) {
    const newItem = this.itemType(data);
    // console.log("newItem: " + JSON.stringify(newItem));
    // console.log("type of new item: " + typeof newItem);
    // console.log("el of new item: " + newItem.el.innerHTML);

    newItem.collection = this;
    // console.log("id of new item: " + this.newIdFrom);
    // newItem.updatePosition();

    // console.log("current newItem: " + JSON.stringify(newItem.collection));
    // newItem.el.querySelector(".slider").dataset.id = this.newIdFrom;
    retrieveChild(newItem.el).dataset.id = this.newIdFrom;
    // console.log("check new method: " + elementsToHTML(newItem.el));
    // console.log("el of new item: " + newItem.el.innerHTML);
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend
    console.log("current el: \n" + elementsToHTML(newItem.el));
    this.el.prepend(newItem.el);

    this.items.push(newItem);
    console.log(this.items);
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
    console.log("color updated");
    this.items.forEach((item) => item._updateColor());
  }
}
