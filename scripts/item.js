"use strict";

const leftBound = -ITEM_HEIGHT;
const rightBound = ITEM_HEIGHT;

const upperSortMoveThreshold = ITEM_HEIGHT * 1.5;
const lowerSortMoveThreshold = ITEM_HEIGHT * 2.5;

class Item {
  constructor(data, listItem) {
    this.x = 0;
    this.y = data.order * ITEM_HEIGHT;
    this.data = data;

    if (listItem) {
      this._updateListCount();
    }

    // only render after listCollection count has been updated
    this._render();

    if (listItem) {
      this._updateCount();
    }

    this._selectStyle();

    this._addImage();

    this._listenField();
  }

  _selectStyle() {
    this.style = this.el.style;
    this.slider = this.el.querySelector(".slider");
    this.sliderStyle = this.slider.style;
  }

  _addImage() {
    this.check = htmlToElements(
      '<img class="check drag" src="images/check.png">'
    );
    this.cross = htmlToElements(
      '<img class="cross drag" src="images/cross.png">'
    );
    this.el.appendChild(this.check);
    this.el.appendChild(this.cross);

    this.checkStyle = this.check.style;
    this.crossStyle = this.cross.style;

    this.checkX = 0;
    this.crossX = 0;
    this.checkO = 0;
    this.crossO = 0;
  }

  _listenField() {
    this.title = this.el.querySelector(".title");
    this.field = this.el.querySelector(".field");
    const t = this;
    // click outside or hit enter will trigger onEditDone
    this.field.addEventListener("blur", this._onEditDone.bind(this));
    this.field.addEventListener("keyup", function (e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
  }

  _updateListCount() {
    this.count = 0;

    if (!this.data.items) this.data.items = [];

    this.data.items.forEach((item) => {
      if (!item.done) this.count++;
    });
  }

  _moveY(y) {
    this.y = y;
    this.style[transformProperty] = `translate3d(0px, ${y}px, 0px)`;
  }

  _moveX(x) {
    this.x = x;
    this.sliderStyle[transformProperty] = `translate3d(${x}px, 0px, 0px)`;
  }

  _moveCheck(x) {
    this.checkX = x;
    this.checkStyle[transformProperty] = `translate3d(${x}px, 0px, 0px)`;
  }

  _moveCross(x) {
    this.crossX = x;
    this.crossStyle[transformProperty] = `translate3d(${x}px, 0px, 0px)`;
  }

  _updatePosition(top) {
    if (top) {
      this.el.classList.add("top");
    }

    this._moveY(this.data.order * ITEM_HEIGHT);

    if (top) {
      this._onTransitionEnd(function (t) {
        t.el.classList.remove("top");
      });
    }
  }

  _onDragStart() {
    this.slider.classList.add("drag");
    this._moveCheck(0);
    this._moveCross(0);
  }

  _onDragMove(dx) {
    const tx = this.x + dx;

    if (this.noDragRight && tx > 0) return;
    if (this.noDragLeft && tx < 0) return;

    if (tx > 0) {
      if (this.noDragRight) return;
      if (tx <= rightBound) {
        // change check img opacity based on drag distance
        const o = tx / rightBound;
        this.checkO = this.data.done ? 1 - o : o;
        this.checkStyle.opacity = `${this.checkO}`;

        if (this.checkX != 0) {
          this._moveCheck(0);
        }
      } else {
        // decrease dx to make it look slow
        dx /= 3;

        this._moveCheck(Math.max(0, this.x + dx - rightBound));

        const targetO = this.data.done ? 0 : 1;
        if (this.checkO != targetO) {
          this.checkO = targetO;
          this.checkStyle.opacity = `${targetO}`;
        }
      }
    } else if (tx < 0) {
      if (this.noDragLeft) return;
      if (tx >= leftBound) {
        this.crossO = tx / leftBound;
        this.crossStyle.opacity = `${this.crossO}`;

        if (this.crossX != 0) {
          this._moveCross(0);
        }
      } else {
        dx /= 3;
        this._moveCross(Math.min(0, this.x + dx - leftBound));

        if (this.crossO != 1) {
          this.crossO = 1;
          this.crossStyle.opacity = "1";
        }
      }
    }
    this._moveX(this.x + dx);
  }

  _onDragEnd() {
    const item = this;
    let doneCallback = null;

    // need to call super._del here, kind of tricky, beyond my current knowledge base
    if (item.x < leftBound) {
      if (this.type === "list-item") {
        this._delete(loopWithCallback);
      } else {
        this._del(loopWithCallback);
      }
      this.collection._updateCount();
      return;
    } else if (item.x > rightBound) {
      doneCallback = function () {
        item._done();
      };
    }

    loop();

    function loop() {
      if (Math.abs(item.x) > 0.1) {
        raf(loop);
        item._moveX(item.x * 0.6);
      } else {
        item._moveX(0);
        item.slider.classList.remove("drag");
        item.checkStyle.opacity = "0";

        if (doneCallback) doneCallback();
      }
    }

    function loopWithCallback(callback) {
      doneCallback = callback;
      loop();
    }
  }

  _del() {
    const t = this;

    t.style[transformProperty] = `translate3d(${
      -window.innerWidth - ITEM_HEIGHT
    }px, ${this.y}px, 0)`;

    t._onTransitionEnd(function (t) {
      t.deleted = true;
      t.el.remove();
      t.collection._collapseAt(t.data.order, t);
    });
    console.log("count: " + this.collection.count);
  }

  _onSortStart() {
    this.el.classList.add("sorting-trans");
    this.el.classList.add("sorting");
  }

  _onSortMove(dy) {
    this._moveY(this.y + dy);

    const c = this.collection;
    const cy = c.y;
    const ay = this.y + cy;

    if (cy < 0 && ay < upperSortMoveThreshold && dy < 3) {
      if (!c.sortMoving) c._sortMove(1, this);
    } else if (
      cy > this.collection.upperBound &&
      ay > clientHeight - lowerSortMoveThreshold &&
      dy > -3
    ) {
      if (!c.sortMoving) c._sortMove(-1, this);
    } else {
      c.sortMoving = false;
      this._checkSwap();
    }
  }

  _checkSwap() {
    // https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript
    const currentAt = Math.min(
      this.collection.items.length - 1,
      ~~((this.y + ITEM_HEIGHT / 2) / ITEM_HEIGHT)
    );
    origin = this.data.order;

    if (currentAt != origin) {
      const targets = this.collection._getItemsBetween(origin, currentAt);
      const increment = currentAt > origin ? -1 : 1;

      targets.forEach((target) => {
        target.data.order += increment;
        target._updatePosition();
      });

      this.data.order = currentAt;
    }
  }

  _onSortEnd() {
    this.collection.sortMoving = false;
    this._updatePosition();
    this.el.classList.remove("sorting");
    this.collection._updateColor();

    this._onTransitionEnd(function (t) {
      t.el.classList.remove("sorting-trans");
    });
  }

  _onTransitionEnd(callback, noStrict) {
    const t = this;
    t.el.addEventListener(transitionEndEvent, function dummy(e) {
      if (e.target !== this && !noStrict) return;
      // https://stackoverflow.com/questions/4402287/javascript-remove-event-listener
      t.el.removeEventListener(transitionEndEvent, dummy);
      callback(t);
    });
  }

  _onEditStart(noRemember) {
    app.isEditing = true;

    this.title.style.display = "none";
    this.field.style.display = "block";
    this.field.focus();
    this.el.classList.add("edit");

    this.collection._onEditStart(this.data.order, noRemember);
  }

  _onEditDone() {
    const val = this.field.value;

    if (!isTouch) {
      this.collection._moveY(beforeEditPosition);
    }
    this.collection.el.classList.remove("shade");
    app.isEditing = false;
    this.el.classList.remove("edit");
    if (!val) {
      this._del();
    } else {
      this.title.style.display = "block";
      this.field.style.display = "none";
      this.el.querySelector(".text").innerText = val;
      this.data.title = val;
      mock._save();
    }
  }

  _clear() {
    this.deleted = true;
    this._moveY(this.y + 1000);
    this._onTransitionEnd(function (t) {
      t.el.remove();
    });
  }

  _ask() {
    if (confirm("Are you sure you want to delete the entire list?")) {
      const t = this;
      setTimeout(function () {
        t._del();
      }, 20);
    } else {
      this.field.style.display = "none";
      this.title.style.display = "block";
    }
  }
}
