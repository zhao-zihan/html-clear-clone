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
      console.log("collection positioned");
      t._updatePosition();
      t._moveY(-t.height - ITEM_HEIGHT);
      t.el.classList.add("drag");
      t.el.style.display = "block";
    }, 0);
  }

  _onDragMove() {
    super._onDragMove.apply(this, arguments);

    const ltc = app.lastTodoCollection;

    if (this.y <= this.upperBound) {
      if (!this.longPullingUp) {
        this.longPullingUp = true;
        ltc.el.classList.add("drag");
        ltc.topSwitch.style.display = "block";
        console.log("long pull up triggered");
      }
      ltc._moveY(
        this.y +
          Math.max(this.height + ITEM_HEIGHT * 2, clientHeight + ITEM_HEIGHT)
      );

      if (this.y < this.upperBound - ITEM_HEIGHT) {
        if (!this.pastLongPullDownThreshold) {
          this.pastLongPullDownThreshold = true;
          ltc.topArrow.classList.add("down");
        }
      } else {
        if (this.pastLongPullDownThreshold) {
          this.pastLongPullDownThreshold = false;
          ltc.topArrow.classList.remove("down");
        }
      }
    } else {
      if (this.longPullingUp) {
        this.longPullingUp = false;
        ltc.topSwitch.display = "none";
        ltc._moveY(clientHeight + ITEM_HEIGHT);
      }
    }
  }

  _onDragEnd() {
    this._resetDragStates();

    if (this.y >= ITEM_HEIGHT) {
      this._createItemAtTop();
      return;
    } else if (this.y <= this.upperBound - ITEM_HEIGHT) {
      this._onPullUp();
      return;
    } else if (this.y <= this.upperBound) {
      const ltc = app.lastTodoCollection;
      ltc.el.classList.remove("drag");
      ltc.el.classList.remove("ease-out");
      ltc._moveY(clientHeight + ITEM_HEIGHT);
      ltc._onTransitionEnd(function () {
        ltc.el.classList.remove("ease-out");
      });
    }
    super._onDragEnd.apply(this, arguments);
  }

  _onPullUp() {
    const ltc = app.lastTodoCollection;
    ltc.el.classList.remove("drag");
    ltc._moveY(0);

    this.el.classList.remove("drag");
    this._moveY(Math.min(-this.height, -clientHeight) - ITEM_HEIGHT * 2);

    app._setCurrentCollection(ltc);

    ltc._onTransitionEnd(function () {
      ltc._resetTopSwitch();
    });

    const t = this;
    t._onTransitionEnd(function () {
      t._positionForPullDown();
    });
  }
}
