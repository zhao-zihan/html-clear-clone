"use strict";

const leftBound = -ITEM_HEIGHT;
const rightBound = ITEM_HEIGHT;

const upperSortMoveThreshold = ITEM_HEIGHT * 1.5;
const lowerSortMoveThreshold = ITEM_HEIGHT * 2.5;

class Item {
  constructor(data, listItem) {
    this.data = data;
    // this._render();
    if (listItem) {
      this._updateListCount();
    }
    console.log("check count: " + this.count);
    this._render();
    this._updateCount();
    // console.log("item el: " + this.el.innerHTML);
    console.log("check el: " + elementsToHTML(this.el));
    this._selectStyle();
    // console.log("check first element: " + this.slider.innerHTML);

    this._addImage();

    this._listenField();

    // console.log("check this.field " + elementsToHTML(this.field));
  }

  _selectStyle() {
    this.style = this.el.style;
    console.log("this.style: " + JSON.stringify(this.style));
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
    // this.field.addEventListener("blur", this._onEditEnd.bind(this));
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
      this.el.classList.add(".top");
    }

    this._moveY(this.data.order * ITEM_HEIGHT);

    if (top) {
      this._onTransitionEnd(function (t) {
        t.el.classList.remove(".top");
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
        this.checkStyle.opacity = this.checkO;

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
          this.checkStyle.opacity = targetO;
        }
      }
    } else if (tx < 0) {
      if (this.noDragLeft) return;
      if (tx >= leftBound) {
        this.crossO = tx / leftBound;
        this.crossStyle.opacity = this.crossO;

        if (this.crossX != 0) {
          this._moveCross(0);
        }
      } else {
        dx /= 3;
        this._moveCross(Math.min(0, this.x + dx - leftBound));

        if (this.crossO != 1) {
          this.crossO = 1;
          this.crossStyle.opacity = 1;
        }
      }
    }
    this._moveX(this.x + dx);
  }

  _onDragEnd() {
    const item = this;
    let doneCallback = null;

    if (item.x < leftBound) {
      this.del(loopWithCallback);
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
        item.checkStyle.opacity = 0;

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
  }

  _onSortStart() {
    this.el.classList.add("sorting-trans");
    this.el.classList.add("sorting");
  }

  _onSortMove() {
    this._moveY(this.y + dy);

    const c = this.collection;
    const cy = c.y;
    const ay = this.y + cy;

    if (cy < 0 && ay < upperSortMoveThreshold && dy < 3) {
      if (!c.sortMoving) c._sortMove(1, this);
    } else if (
      cy > this.collection.upperBound &&
      ay > window.innerHeight - lowerSortMoveThreshold &&
      dy > -3
    ) {
      if (!c.sortMoving) c._sortMove(-1, this);
    } else {
      c.sortMoving = false;
      this._checkSwap();
    }
  }

  _checkSwap() {
    const currentAt = Math.min(
      this.collection.items.length - 1,
      ~~((this.y + ITEM_HEIGHT / 2) / ITEM_HEIGHT)
    );

    if (currentAt != origin) {
      const targets = this.collection.getItemsBetween(origin, currentAt);
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
    t.el.addEventListener(transitionEndEvent, function (e) {
      if (e.target !== this && !noStrict) return;
      t.el.removeEventListener(transitionEndEvent);
      callback(t);
    });
  }

  _onEditStart(noRemember) {
    app.isEditing = true;

    this.title.display = "none";
    this.field.display = "block";
    this.field.focus();
    this.el.classList.add("edit");

    this.collection._onEditStart(this.data.order, noRemember);
  }

  _onEditDone() {
    const t = this;
    const val = t.field.value;

    t.collection._onEditDone(function () {
      app.isEditing = false;

      t.el.classList.remove("edit");

      if (!val) {
        t._del();
      } else {
        t.field.display = "none";
        t.title.display = "block";
        t.querySelector(".text").innerText = val;
        t.data.title = val;
        mock._save();
      }
    });
  }

  _clear() {
    this.deleted = true;
    this._moveY(this.y + 1000);
    this._onTransitionEnd(function (t) {
      t.el.remove();
    });
  }
}
