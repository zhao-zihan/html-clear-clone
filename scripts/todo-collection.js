"use strict";

class TodoCollection extends Collection {
  constructor(data, listItem) {
    super(data);
    console.log("super called");
    this.stateType = states.TODO_COLLECTION_VIEW;
    this.itemType = function (data) {
      return new TodoItem(data);
    };
    this.itemTypeText = "Item";
    this.listItem = listItem;
    this._populateItems();
  }

  _render() {
    this.el = htmlToElements(`
    <div class="collection">
        <div class="top-switch">
            <img class="arrow" src="images/arrow.png"> <span class="text">Switch To Lists</span>
        </div>
        <div class="bottom-switch">
            <div class="drawer"><img class="arrow-small" src="images/arrow-small.png"></div>
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

    this.topSwitch = this.el.querySelector(".top-switch");
    this.topArrow = this.topSwitch.querySelector(".arrow");
    this.topText = this.topArrow.querySelector(".text");

    this.bottomSwitch = this.el.querySelector(".bottom-switch");
    this.drawer = this.bottomSwitch.querySelector(".drawer");
    this.smallArrowStyle =
      this.bottomSwitch.querySelector(".arrow-small").style;
  }

  _load(at, noAnimation) {
    this.initiated = true;

    const t = this;

    t._updateColor();

    if (noAnimation) {
      this._updatePosition();
      itemContainer.prepend(this.el);
    } else {
      if (t.initiated) {
        t.el.remove();
      }
      t._moveY(at * ITEM_HEIGHT + app.listCollection.y);
      t.items.forEach((item) => item._moveY(0));

      t.el.classList.remove("drag");
      itemContainer.prepend(this.el);

      setTimeout(function () {
        t._moveY(0);
        t._updatePosition();
      }, 0);
    }
  }

  _updateCount() {
    this.listItem.count = this.count;
    this.listItem._updateCount();
    this.hasDoneItems = this.items.length > this.count;
  }
}
