"use strict";

const listItemVars = {
  baseH: 212,
  baseS: 93,
  baseL: 53,

  stepH: -2.5,
  stepS: 1,
  stepL: 2.5,

  maxColorSpan: 5,

  spanH: this.maxColorSpan * this.stepH,
  spanS: this.maxColorSpan * this.stepS,
  spanL: this.maxColorSpan * this.stepL,
};

class ListItem extends Item {
  type = "list-item";

  constructor(data) {
    super(data, true);
    // console.log("check count: " + this.count);

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
    // console.log("successfully rendered\n " + elementsToHTML(this.el));
  }

  _updateColor() {
    // console.log("list item color updated");
    const o = this.data.order;
    const n = this.collection.count;
    // console.log("check o: " + o + " check n: " + n);
    let sH = listItemVars.stepH;
    let sS = listItemVars.stepS;
    let sL = listItemVars.stepL;

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

    console.log("check sliderStyle: " + this.slider.innerHTML);
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

    app.currentCollection._open(this.data.order);

    if (!this.toDoCollection) {
      this.toDoCollection = new TodoCollection(this.data, this);
    }
    this.toDoCollection._load(this.data.order);

    app._setCurrentCollection(this.toDoCollection);
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

  _del(loopWithCallback) {
    const t = this;

    if (t.count === 0) {
      // https://stackoverflow.com/questions/11854958/how-to-call-a-parent-method-from-child-class-in-javascript
      super._del.apply(t);
    } else {
      if (loopWithCallback) {
        loopWithCallback(ask);
      } else {
        if (confirm("Are you sure you want to delete the entire list?")) {
          super._del();
        } else {
          t.field.display = "none";
          t.title.display = "block";
        }
      }
    }
  }

  _updateCount() {
    console.log("I'm called");
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
