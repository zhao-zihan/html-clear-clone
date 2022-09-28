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
    console.log("check count: " + this.count);

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
    console.log("successfully rendered\n " + elementsToHTML(this.el));
  }

  _updateColor() {
    console.log("list item color updated");
    const o = this.data.order;
    const n = this.collection.count;
    console.log("check o: " + o + " check n: " + n);
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
}
