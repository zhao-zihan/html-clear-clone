"use strict";

const dragElasticity = 0.45;
const friction = 0.95;
const speedMultiplier = 16;
const maxSpeed = 35;
const diff = 0.5; // the min distance from target an animation loop chain should reach before ending
const sortMoveSpeed = 4.5;

let beforeEditPosition = 0;

class Collection {
  constructor(data) {
    this._init(data);
    this._render();
    this._initDummyItems();

    this._resetDragStates();
    // this._populateItems();
  }

  _init(data) {
    this.y = 0;
    this.upperBound = 0;
    this.initiated = false;

    this.data = data || mock.data;
    // console.log("init in collection " + this.data);
    this.items = [];
  }

  _resetDragStates() {
    this.pullingDown = false;
    this.pastPullDownThreshold = false;

    this.longPullingDown = false;
    this.longPullingUp = false;
    this.pastLongPullDownThreshold = false;
    this.pastLongPullUpThreshold = false;
  }

  _initDummyItems() {
    this.topDummy = this.el.querySelector(".dummy-item.top");
    console.log("check top dummy: " + elementsToHTML(this.topDummy));
    this.topDummySlider = this.topDummy.querySelector(".slider");
    this.topDummyText = this.topDummy.querySelector(".title");
    this.topDummySliderStyle = this.topDummySlider.style;
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
    this._updateBounds();
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

  _getItemsByOrder(order) {
    const i = this.items.length;
    let item;

    while (i--) {
      item = this.items[i];
      if (item.data.order === order) {
        return item;
      }
    }
  }

  _getItemsBetween(origin, target) {
    const result = [];

    this.items.forEach((item) => {
      const order = item.data.order;
      if (
        (order > origin && order <= target) ||
        (order < origin && order >= target)
      ) {
        result.push(item);
      }
    });

    return result;
  }

  _updateColor() {
    // console.log("color updated");
    this.items.forEach((item) => item._updateColor());
  }

  _updatePosition() {
    this.items
      .slice()
      .reverse()
      .forEach((item) => item._updatePosition());
  }

  _moveY() {
    this.y = y;
    this.style[transformProperty] = `translate3d(0px, ${y}px, 0px)`;
  }

  _collapseAt(at, target) {
    let delIndex;

    this.items.forEach((item, i) => {
      if (item === target) {
        if (target.deleted) delIndex = i;
      } else if (item.data.order > at && (!item.data.done || target.deleted)) {
        item.data.order--;
        item._updateColor();
        item._updatePosition();
      } else {
        item._updateColor();
      }
    });

    if (delIndex || delIndex === 0) {
      items.splice(delIndex, 1);
      this._updateBounds();

      if (!target.data.done) {
        this.count--;
        if (this._updateCount) {
          this._updateCount();
        }
      }

      mock._deleteItem(target.data, this.data);
      mock._save();
    }
  }

  _updateBounds(noMove) {
    this.height = this.items.length * ITEM_HEIGHT;
    this.upperBound = Math.min(
      0,
      window.innerHeight - (this.height + ITEM_HEIGHT)
    );

    if (this.y < this.upperBound && !noMove) {
      this._moveY(this.upperBound);
    }
  }

  _onDragStart() {
    this.el.classList.add("drag");
  }

  _onDragMove(dy) {
    if (this.y + dy < this.upperBound || this.y + dy > 0) {
      dy *= dragElasticity;
    }

    this._moveY(this.y + dy);

    if (this.y > 0) {
      if (!this.pullingDown) {
        this.pullingDown = true;
        this.topDummyText.innerText = `Pull to Create ${this.itemTypeText}`;
      }
      if (this.y <= ITEM_HEIGHT) {
        if (this.pastPullDownThreshold) {
          this.pastPullDownThreshold = false;
          this.topDummyText.innerText = `Pull to Create ${this.itemTypeText}`;
        }
        const pct = this.y / ITEM_HEIGHT;
        const r = Math.max(0, (1 - pct) * 90);
        this.topDummySliderStyle[transformProperty] = `rotateX(${r}deg)`;
        this.topDummySliderStyle.opacity = pct / 2 + 0.5;
      } else {
        if (!this.pastPullDownThreshold) {
          this.pastPullDownThreshold = true;
          this.topDummySliderStyle[transformProperty] = "none";
          this.topDummySliderStyle.opacity = 1;
          this.topDummyText.innerText = `Release to Create ${this.itemTypeText}`;
        }
      }
    } else {
      if (this.pullingDown) {
        this.pullingDown = false;
        this.topDummy.display = "none";
      }
    }
  }

  _onDragEnd(speed) {
    const col = this;
    speed = Math.max(-maxSpeed, Math.min(maxSpeed, speed * speedMultiplier));

    col.inMomentum = true;
    loop();

    function loop() {
      if (pub.isDown) {
        endLoop();
        return;
      }

      if (col.y < col.upperBound - diff) {
        col.y += (col.upperBound - col.y) / 5;
        speed *= 0.85;
        if (col.y < col.upperBound - diff) {
          raf(loop);
          render();
        } else {
          col._moveY(col.upperBound);
          endLoop();
        }
      } else if (col.y > diff) {
        col.y *= 0.8;
        speed *= 0.85;

        if (col.y > diff) {
          raf(loop);
          render();
        } else {
          col._moveY(0);
          endLoop();
        }
      } else if (Math.abs(speed) > 0.1) {
        raf(loop);
        render();
      } else {
        endLoop();
      }
    }

    function endLoop() {
      col.el.classList.remove("drag");
      col.inMomentum = false;
      col.topDummy.display = "none";
      if (col.bottomSwitch) col.bottomSwitch.display = "none";
    }

    function render() {
      col._moveY(col.y + speed);
      speed *= friction;
      if (col.y >= 0) {
        const pct = col.y / ITEM_HEIGHT;
        const r = Math.max(0, (1 - pct) * 90);
        col.topDummySliderStyle[transformProperty] = `rotateX(${r}deg)`;
        col.topDummySliderStyle.opacity = pct / 2 + 0.5;
      }
    }
  }

  _onTap() {
    if (this.hasDoneItems) {
      this._createItemInBetween();
    } else {
      this._createItemAtBottom();
    }
  }

  _sortMove(dir, target) {
    const col = this;
    const dy = dir * sortMoveSpeed;

    col.sortMoving = true;
    col.el.classList.add("drag");
    loop();

    function loop() {
      if (!col.sortMoving) {
        col.el.classList.remove("drag");
        return;
      }
    }

    raf(loop);

    const cty = Math.max(col.upperBound, Math.min(0, col.y + dy));

    target._moveY(target.y - (cty - col.y));
    target._checkSwap();

    col._moveY(cty);
  }

  _onEditStart(at, noRemember) {
    beforeEditPosition = noRemember ? 0 : this.y;

    const t = this;
    setTimeout(function () {
      if (!isTouch) {
        t._moveY(-at * ITEM_HEIGHT);
      }

      if (noRemember) {
        t.el.classList.remove("drag");
        t.el.classList.add("ease-out");
        t._moveY(0);
        t._onTransitionEnd(function () {
          t.el.classList.remove("ease-out");
        });
      }
      t.el.classList.add("shade");
    }, 0);
  }

  _onEditDone(callback) {
    if (!isTouch) {
      this._moveY(beforeEditPosition);
    }

    this.el.classList.remove("shade");
    if (this.items.length === 1) {
      callback();
    } else {
      this._onTransitionEnd(callback, true);
    }
  }

  _createItemAtTop() {
    this.topDummy.display = "none";
    this.topDummyText.innerText = `Pull to Create ${this.itemTypeText}`;

    this._moveY(this.y - ITEM_HEIGHT);

    this.el.classList.add("instant");
    this.items.forEach((item) => {
      item.data.order++;
      item._moveY(item.y + ITEM_HEIGHT);
    });

    const col = this;
    setTimeout(function () {
      col.el.classList.remove("instant");
    }, 0);

    const newData = {
      title: "",
      order: 0,
    };

    mock._addItem(newData, this.data);

    const newItem = this._addItem(newData);

    this._updateColor();
    this._updateBounds();

    newItem._onEditStart(true);
  }

  _createItemAtBottom() {
    const newData = {
      title: "",
      order: this.count,
    };

    mock._addItem(newData, this.data);

    const newItem = this._addItem(newData);
    this._updateColor();
    this._updateBounds();

    newItem.el.classList.add("dummy-item bottom");

    const fieldEl = newItem.el.querySelector(".field");
    fieldEl.display = "block";
    fieldEl.focus();

    setTimeout(function () {
      newItem.el.querySelector(".slider").style[
        transformProperty
      ] = `rotateX(0deg)`;
      newItem._onTransitionEnd(function () {
        newItem.el.classList.remove("dummy-item bottom");
        newItem._onEditStart();
      }, true);
    }, 50);
  }

  _createItemInBetween() {
    const newData = {
      title: "",
      order: this.count,
    };

    mock._addItem(newData, this.data);

    const newItem = this._addItem(newData);
    this._updateColor();
    this._updateBounds();

    const lastUndone = this._getItemsByOrder(this.count - 1);
    const color = lastUndone.el.querySelector(".slider").style.backgroundColor;
    const dummy = new UnfoldDummy({
      order: this.count,
      color: color,
    });
    this.el.prepend(dummy.el);

    newItem.el.classList.add("drag");
    newItem.el.style.opacity = "0.1";
    newItem.querySelector(".field").display = "block";
    newItem.querySelector(".field").focus();

    const col = this;
    setTimeout(function () {
      col.items.forEach((item) => {
        if (item.data.done) {
          item.data.order++;
          item._moveY(item.y + ITEM_HEIGHT);
        }
      });

      dummy.el.classList.add("open");
      dummy.el.addEventListener(transitionEndEvent, function () {
        dummy.el.removeEventListener(transitionEndEvent);
        newItem.el.style.opacity = "";
        setTimeout(function () {
          newItem.el.classList.remove("drag");
          newItem._onEditStart();
          dummy.el.remove();
          dummy = null;
        }, 0);
      });
    }, 50);
  }

  _onTransitionEnd(callback, noStrict) {
    const t = this;
    t.el.addEventListener(transitionEndEvent, function (e) {
      if (e.target !== this && !noStrict) return;
      t.el.removeEventListener(transitionEndEvent);
      callback();
    });
  }
}
