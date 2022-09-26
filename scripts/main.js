"use strict";

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
}

class ListCollection extends Collection {
  constructor() {
    super();
    this.stateType = App.states.LIST_COLLECTION_VIEW;
    this.itemType = function () {
      return new ListItem(arguments);
    };
  }
}

//////////////////////////////////////////////////////

class Item {
  itemHeight = 62;

  constructor(data) {
    this.data = data;
    this.htmlEl = [];
    this.style = this.htmlEl[0].style;
    this.slider = this.htmlEl.querySelectorAll(".slider");
    this.sliderStyle = this.slider[0].style;
  }
}

const listItemVars = {
  baseH: 212,
  baseS: 93,
  baseL: 53,

  stepH: -2.5,
  stepS: 1,
  stepL: 2.5,

  maxColorSpan: 5,

  spanH: maxColorSpan * stepH,
  spanS: maxColorSpan * stepS,
  spanL: maxColorSpan * stepL,
};

class ListItem extends Item {
  type = "list-item";

  constructor(data) {
    super(data);
    this.h = listItemVars.baseH;
    this.s = listItemVars.baseS;
    this.l = listItemVars.baseL;
    this.toDoCollection = null;

    this.count = 0;

    if (!data.items) data.items = [];

    let i = data.items.length;
    let item;

    while (i--) {
      item = data.items[i];
      if (!item.done) this.count++;
    }
  }

  _render() {
    this.el = `
      <div class="item list-item ${this.count ? "" : "empty"}">
          <div class="slider">
              <div class="inner">
                  <span class="title"><span class="text">${
                    this.data.title
                  }</span></span>
                  <div class="count">${this.count}</div>
                  <input class="field" type="text" value="${this.data.title}">
              </div>
          </div>
      </div>
    `;
    this.htmlEl.push(this.el);
    this.countEl = document.querySelector(".count");
  }

  _updateColor() {
    const o = this.data.order;
    const n = this.collection.count;
    let sH = listItemVars.stepH;
    let sS = listItemVars.stepS;
    let sL = listItemVars.stepL;

    if (n > listItemVars.maxColorSpan) {
      sH = listItemVars.spanH / n;
      sS = listItemVars.spanS / n;
      sL = listItemVars.spanL / n;
    }

    this.sliderStyle.backgroundColor = `
      hsl(${listItemVars.baseH + o * sH}, 
        ${Math.min(100, listItemVars.baseS + o * sS)}%, 
        ${Math.min(100, listItemVars.baseL + o * sL)}%)
    `;
  }
}

const todoItemVars = {
  baseH: 354,
  baseS: 100,
  baseL: 46,

  stepH: 7,
  stepL: 2,

  maxColorSpan: 7,

  spanH: stepH * maxColorSpan,
  spanL: stepL * maxColorSpan,
};

class TodoItem extends Item {
  type = "todo-item";

  constructor(data) {
    super(data);
    this.h = todoItemVars.baseH;
    this.s = todoItemVars.baseS;
    this.l = todoItemVars.baseL;
  }

  _render() {
    this.el = `
      <div class="item todo-item ${
        this.data.done ? "done" : ""
      }" style="z-index: ${this.data.order}">
          <div class="slider">
              <div class="inner">
                  <span class="title">
                      <span class="text">${this.data.title}</span>
                      <span class="line"></span>
                  </span>
                  <input class="field" type="text" value="${this.data.title}">
              </div>
          </div>
      </div>
    `;
    this.htmlEl.push(this.el);
    this.lineStyle = this.htmlEl.querySelectorAll(".line")[0].style;
    if (this.data.done) this.lineStyle.width = "100%";
  }

  _updateColor(order) {
    const o = order || this.data.order;
    const n = this.collection.count;
    let sH = todoItemVars.stepH;
    let sL = todoItemVars.stepL;

    if (n > todoItemVars.maxColorSpan && !order) {
      sH = todoItemVars.spanH / n;
      sL = todoItemVars.spanL / n;
    }

    this.sliderStyle.backgroundColor = `
      hsl(${todoItemVars.baseH + o * sH},
        ${o ? todoItemVars.baseS - 10 : todoItemVars.baseS}%,
        ${todoItemVars.baseL + o * sL}%)
    `;
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
