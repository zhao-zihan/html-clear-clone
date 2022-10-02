"use strict";

class ListCollection extends Collection {
  constructor(data) {
    super(data);
    this.stateType = states.LIST_COLLECTION_VIEW;
    this.itemType = function (data) {
      return new ListItem(data);
    };
    this.itemTypeText = "List";

    // this._render();

    this._populateItems();
    this._updateColor();
  }

  _render() {
    this.el = htmlToElements(`
      <div id="list-collection" class="collection">
          <div class="credit">Made by Zihan Zhao <br> Inspired by Evan You</div>
              <div class="item dummy-item top list-item empty">
                  <div class="slider" style="background-color:rgb(23,128,247)">
                    <div class="inner">
                      <span class="title">Pull to Create List</span>
                      <div class="count">0</div>
                    </div>
              </div>
          </div>
      </div>`);
    this.style = this.el.style;
  }

  _load() {
    this.initiated = true;
    // itemContainer.insertAdjacentHTML("afterend", this.el.innerHTML);
    // console.log("this.el in load: " + elementsToHTML(this.el));
    // itemContainer.innerHTML = elementsToHTML(this.el);
    itemContainer.appendChild(this.el);
  }

  _open(at) {
    this.openedAt = at;

    let t = this;
    let ty;

    // let i = t.items.length;
    // let item;
    // let ty;

    // while (i--) {
    //   item = t.items[i];
    //   if (item.data.order <= at) {
    //     ty = (item.data.order - at) * ITEM_HEIGHT - t.y;
    //   } else {
    //     ty = window.innerHeight + (item.data.order - at) * ITEM_HEIGHT - t.y;
    //   }
    //   item.moveY(ty);
    // }

    t.items
      .slice()
      .reverse()
      .forEach((item) => {
        ty =
          item.data.order <= at
            ? (item.data.order - at - 1) * ITEM_HEIGHT
            : (t.data.items[at].items.length + (item.data.order - at - 1)) *
              ITEM_HEIGHT;
        item._moveY(ty);
      });

    t.items[0]._onTransitionEnd(function () {
      t._positionForPullDown();
    });
  }

  _positionForPullDown() {
    const t = this;
    t.el.style.display = "none";

    setTimeout(function () {
      t._updatePosition();
      t._moveY(-t.height - ITEM_HEIGHT);
      t.el.classList.add("drag");
      t.el.display = "block";
    }, 0);
  }

  _onDragMove() {
    super._onDragMove.apply(this, arguments);

    const ltc = app.lastTodoCollection;

    if (this.y <= this.upperBound) {
      if (!this.longPullingUp) {
        this.longPullingUp = true;
        ltc.el.classList.add("drag");
        ltc.topSwitch.display = "block";
      }
    }
  }
}
