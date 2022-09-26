"use strict";

class Item {
  id = (Date.now() + "").slice(-10);

  constructor(text) {
    this.text = text;
  }
}

class CollectionItem extends Item {
  type = "collection";

  constructor(text) {
    super(text);
  }
}

class ListItem extends Item {
  type = "list";

  constructor(text) {
    super(text);
  }
}

class Collection {
  constructor() {
    this.data = App.mock.data;
    this.items = [];
    this._render();
    this._populateItems();
  }

  _populateItems() {
    const items = this.data.items;
    const i = items.length;

    this.count = 0;
    this.hash = {};

    while (i--) {
      this._addItem(items[i]);
    }

    this.hasDoneItems = this.items.length > this.count;
  }

  _addItem(data) {
    const newItem = this.itemType(data);

    newItem.collection = this;
    newItem.updatePosition();

    newItem.htmlElement.dataset.id;
  }
}

//////////////////////////////////////////////////////

const itemContainer = document.querySelector(".wrapper");

class App {
  constructor() {
    this.states = {
      LIST_COLLECTION_VIEW: "lists",
      TODO_COLLECTION_VIEW: "todos",
    };
    this._getLocalStorage();
  }

  _init() {}

  _renderItem(item) {
    let html = `
      
    `;
  }

  _setLocalStorage() {
    localStorage.setItem("listItems", JSON.stringify(this.#listItems));
    localStorage.setItem(
      "collectionItems",
      JSON.stringify(this.#collectionItems)
    );
  }

  _getLocalStorage() {
    const listData = JSON.parse(localStorage.getItem("listItems"));
    const collectionData = JSON.parse(localStorage.getItem("collectionItems"));

    if (listData) {
      this.#listItems = listData;

      this.#listItems.forEach((item) => this._renderItem(item));
    }

    if (collectionData) {
      this.#collectionItems = collectionData;

      this.#collectionItems.forEach((item) => this._renderItem(item));
    }
  }
}
