"use strict";

const listItemVars = {
  baseH: 212,
  baseS: 93,
  baseL: 53,

  stepH: -2.5,
  stepS: 1,
  stepL: 2.5,

  maxColorSpan: 5,

  // spanH: maxColorSpan * stepH,
  // spanS: maxColorSpan * stepS,
  // spanL: maxColorSpan * stepL,
};

// won't work the above way, plus you can't use this keyword within an object
// https://stackoverflow.com/questions/4616202/self-references-in-object-literals-initializers
listItemVars.spanH = listItemVars.maxColorSpan * listItemVars.stepH;
listItemVars.spanS = listItemVars.maxColorSpan * listItemVars.stepS;
listItemVars.spanL = listItemVars.maxColorSpan * listItemVars.stepL;

class ListItem extends Item {
  type = "list-item";

  constructor(data) {
    super(data, true);

    if (this.count === 0) {
      this.noDragRight = true;
    }

    this.h = listItemVars.baseH;
    this.s = listItemVars.baseS;
    this.l = listItemVars.baseL;
    this.toDoCollection = null;
  }

  _render() {
    this.el = htmlToElements(`
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
    `);
    this.countEl = this.el.querySelector(".count");
  }

  _updateColor() {
    const o = this.data.order;
    const n = this.collection.count;
    let sH = listItemVars.stepH;
    let sS = listItemVars.stepS;
    let sL = listItemVars.stepL;

    // if too many, decrease color steps
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

  _onTap(e) {
    if (e.target.className === "text") {
      this._onEditStart();
    } else {
      this._open();
    }
  }

  _open() {
    if (this.collection.inMomentum) return;
    this.el.classList.add("fade");

    // a little bit dangerous here, could be invoked before app initialized
    app.listCollection._open(this.data.order);

    if (app.lastTodoCollection) {
      app.lastTodoCollection.el.remove();
    }

    if (!this.toDoCollection) {
      this.toDoCollection = new TodoCollection(this.data, this);
    }
    this.toDoCollection._load(this.data.order);

    app._setCurrentCollection(this.toDoCollection);
    app._setLastTodoCollection(this.toDoCollection);
  }

  _done() {
    if (
      !confirm("Are you sure you want to complete all your items in this list?")
    )
      return;

    this.data.items.forEach((item) => (item.done = true));

    this.count = 0;
    this._updateCount();

    mock._save();
  }

  _delete(loopWithCallback) {
    const t = this;

    if (t.count === 0) {
      // https://stackoverflow.com/questions/11854958/how-to-call-a-parent-method-from-child-class-in-javascript
      this._del();
    } else {
      if (loopWithCallback) {
        loopWithCallback(super._ask.apply(this));
      } else {
        super._ask();
      }
    }
  }

  _updateCount() {
    this.countEl.innerText = this.count;
    if (this.count === 0) {
      this.el.classList.add("empty");
      this.noDragRight = true;
    } else {
      this.el.classList.remove("empty");
      this.noDragRight = false;
    }
  }
}
