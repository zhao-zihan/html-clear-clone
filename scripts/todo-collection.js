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
    this.listItem = listItem || app.listCollection._getItemByOrder(data.order);
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
    this.topText = this.topSwitch.querySelector(".text");

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
      itemContainer.appendChild(this.el);
    } else {
      if (t.initiated) {
        t.el.remove();
      }
      t._moveY(at * ITEM_HEIGHT + app.listCollection.y);
      t.items.forEach((item) => item._moveY(0));

      t.el.classList.remove("drag");
      itemContainer.appendChild(this.el);

      setTimeout(function () {
        t._moveY(0);
        t._updatePosition();
      }, 0);
    }
  }

  _floatUp(target) {
    const below = target.data.order - 1;
    target.data.order = this.count - 1;
    this.items.forEach((item) => {
      if (item === target) {
        item._updateColor();
        item._updatePosition(true);
      } else if (item.data.done && item.data.order < below) {
        item.data.order++;
        item._updatePosition();
      } else {
        item._updateColor();
      }
    });
  }

  _updateCount() {
    this.listItem.count = this.count;
    this.listItem._updateCount();
    this.hasDoneItems = this.items.length > this.count;
  }

  _onDragMove() {
    super._onDragMove.apply(this, arguments);

    const lc = app.listCollection;

    // long pull down, go back to list
    if (this.y >= ITEM_HEIGHT * 2) {
      if (!this.longPullingDown) {
        this.longPullingDown = true;
        this.topSwitch.style.display = "block";
        this.topSwitch.style[
          transformProperty
        ] = `translate3d(0px, ${-ITEM_HEIGHT}px, 0px)`;
        this.topDummy.style.opacity = "0";
      }
      lc._moveY(this.y - lc.height - ITEM_HEIGHT * 2);
    } else {
      if (this.longPullingDown) {
        this.longPullingDown = false;
        this.topDummy.style.opacity = "1";
        this.topSwitch.style.display = "none";
        lc._moveY(-lc.height - ITEM_HEIGHT * 2);
      }
    }

    if (this.y < this.upperBound) {
      if (!this.longPullingUp) {
        this.longPullingUp = true;

        const pos =
          Math.max(clientHeight, this.height + ITEM_HEIGHT) + ITEM_HEIGHT;
        this.bottomSwitch.style[
          transformProperty
        ] = `translate3d(0px, ${pos}px, 0px)`;
        this.bottomSwitch.style.display = "block";
        this.smallArrowStyle.display = "block";

        if (this.hasDoneItems) {
          this.bottomSwitch.classList.remove("empty");
          this.drawer.classList.remove("full");
        } else {
          this.bottomSwitch.classList.remove("empty");
        }
      }

      let offset = ((this.upperBound - this.y) / (2 * ITEM_HEIGHT)) * 15;
      this.smallArrowStyle[
        transformProperty
      ] = `translate3d(0px, ${offset}px, 0)`;

      if (this.y < this.upperBound - ITEM_HEIGHT * 2) {
        if (!this.pastLongPullUpThreshold) {
          this.pastLongPullUpThreshold = true;
          this.drawer.classList.add("full");
        }
      } else {
        if (this.pastLongPullUpThreshold) {
          this.pastLongPullUpThreshold = false;
          this.drawer.classList.remove("full");
        }
      }
    } else {
      if (this.longPullingUp) {
        this.longPullingUp = false;
        this.bottomSwitch.style.display = "none";
      }
    }
  }

  _onDragEnd() {
    this._resetDragStates();
    this.topSwitch.style.display = "none";

    if (this.y >= ITEM_HEIGHT * 2) {
      this._onPullDown();
      return;
    } else if (this.y >= ITEM_HEIGHT) {
      this._createItemAtTop();
      return;
    } else if (this.y <= this.upperBound - ITEM_HEIGHT * 2) {
      this._onPullUp();
    }

    super._onDragEnd.apply(this, arguments);
  }

  _onPullDown() {
    const lc = app.listCollection;

    const fadeItem = lc._getItemByOrder(lc.openedAt);

    if (fadeItem) fadeItem.el.classList.remove("fade");

    lc.el.classList.remove("drag");
    lc._moveY(0);

    this.el.classList.remove("drag");
    this._moveY(Math.max(lc.height, clientHeight) + ITEM_HEIGHT * 2);

    app._setCurrentCollection(lc);
    app._setLastTodoCollection(this);

    const t = this;
    t._onTransitionEnd(function () {
      t._positionForPullUp();
    });
  }

  _onPullUp() {
    if (!this.hasDoneItems) return;

    let dist;
    const unDoneHeight =
      this.height - (this.items.length - this.count) * ITEM_HEIGHT;
    if (unDoneHeight > clientHeight) {
      dist = ITEM_HEIGHT * 2;
    } else {
      dist = clientHeight - unDoneHeight + ITEM_HEIGHT * 2;
    }

    this.items.forEach((item, index) => {
      if (item.data.done) {
        item._clear(dist);
        this.items.splice(index, 1);
        mock._deleteItem(item.data, this.data);
      }
    });

    this.hasDoneItems = false;
    this._updateBounds(true);

    mock._save();
  }

  _positionForPullUp() {
    this.el.classList.add("drag");
    this._moveY(clientHeight + ITEM_HEIGHT);
    this.topText.innerText = this.data.title;
    this.topArrow.classList.remove("down");
    this.topDummy.style.display = "none";
    this.topDummy.style.opacity = "1";
    this.topDummyText.innerText = `Pull to Create ${this.itemTypeText}`;
  }

  _resetTopSwitch() {
    this.topSwitch.style.display = "none";
    this.topText.innerText = "Switch to Lists";
    this.topArrow.classList.remove("down");
    this.el.querySelector(".dummy-item").style.display = "block";
  }
}
