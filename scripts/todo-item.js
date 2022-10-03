"use strict";

const todoItemVars = {
  baseH: 354,
  baseS: 100,
  baseL: 46,

  stepH: 7,
  stepL: 2,

  maxColorSpan: 7,

  // spanH: this.stepH * this.maxColorSpan,
  // spanL: this.stepL * this.maxColorSpan,
};

// https://stackoverflow.com/questions/4616202/self-references-in-object-literals-initializers
todoItemVars.spanH = todoItemVars.stepH * todoItemVars.maxColorSpan;
todoItemVars.spanL = todoItemVars.stepL * todoItemVars.maxColorSpan;

class TodoItem extends Item {
  type = "todo-item";

  constructor(data) {
    super(data);
    this.h = todoItemVars.baseH;
    this.s = todoItemVars.baseS;
    this.l = todoItemVars.baseL;
  }

  _render() {
    this.el = htmlToElements(`
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
    `);
    this.lineStyle = this.el.querySelector(".line").style;
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

  _onTap() {
    if (!this.data.done) {
      this._onEditStart();
    } else {
      this.collection._onTap();
    }
  }

  _onDragMove(dx) {
    let w = (Math.min(1, Math.max(0, this.x / ITEM_HEIGHT)) * 100).toFixed(2);
    this.lineStyle.width = `${this.data.done ? 100 - w : w}%`;

    if (this.x >= rightBound) {
      if (!this.activated) {
        this.activated = true;
        if (this.data.done) {
          this._updateColor(
            Math.min(this.data.order, todoItemVars.maxColorSpan)
          );
          this.el.classList.remove("done");
        } else {
          this.el.classList.add("green");
        }
      }
    } else {
      if (this.activated) {
        this.activated = false;
        if (this.data.done) {
          this.el.classList.add("done");
        } else {
          this.el.classList.remove("green");
        }
      }
    }

    super._onDragMove.apply(this, arguments);
  }

  _onDragEnd() {
    if (this.x < rightBound) {
      if (this.data.done) {
        this.lineStyle.width = "100%";
      } else {
        this.lineStyle.width = "0%";
      }
    }

    super._onDragEnd.apply(this);
  }

  _onSortEnd() {
    if (!this.data.done) {
      if (this.data.order >= this.collection.count) {
        this._beDone();
      }
    } else {
      if (this.data.order < this.collection.count) {
        this._unDone();
      }
    }

    super._onSortEnd.apply(this);
  }

  _done() {
    if (!this.data.done) {
      this._beDone();

      const at = this.data.order;
      this.data.order = this.collection.count;
      this._updatePosition(true);

      this.collection._collapseAt(at, this);
    } else {
      this._unDone();
      this.collection._floatUp(this);
    }

    mock._save();
  }

  _beDone() {
    this.data.done = true;
    this.lineStyle.width = "100%";
    this.el.classList.remove("green");
    this.el.classList.add("done");
    this.collection.count--;
    this.collection._updateCount();
  }

  _unDone() {
    this.data.done = false;
    this.lineStyle.width = "0%";
    this.el.classList.remove("done");
    this.collection.count++;
    this.collection._updateCount();
  }
}
