"use strict";

class TodoCollection extends Collection {
  constructor(data, listItem) {
    super(arguments);
    this.stateType = states.TODO_COLLECTION_VIEW;
    this.itemType = function () {
      return new TodoItem(arguments);
    };
    this.itemTypeText = "Item";
    this.listItem = listItem;
  }

  _render() {
    this.el = htmlToElements(`
    <div class="collection">
        <div class="top-switch">
            <img class="arrow" src="img/arrow.png"> <span class="text">Switch To Lists</span>
        </div>
        <div class="bottom-switch">
            <div class="drawer"><img class="arrow-small" src="img/arrow-small.png"></div>
            <span class="text">Pull to Clear</span>
        </div>
        <div class="item dummy-item top">
            <div class="slider" style="background-color:rgb(235,0,23)"><div class="inner">
                <span class="title">Pull to Create Item</span>
            </div></div>
        </div>
    </div>
    `);

    this.style = this.el.style;
  }

  _load(at, noAnimation) {
    this.initiated = true;

    const t = this;

    t._updateColor();

    itemContainer.insertAdjacentHTML("afterend", this.el);
  }
}
