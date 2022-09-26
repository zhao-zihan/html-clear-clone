"use strict";

const todoItemVars = {
  baseH: 354,
  baseS: 100,
  baseL: 46,

  stepH: 7,
  stepL: 2,

  maxColorSpan: 7,

  spanH: this.stepH * this.maxColorSpan,
  spanL: this.stepL * this.maxColorSpan,
};

class TodoItem extends Item {
  type = "todo-item";

  constructor(data) {
    super(data);
    this.h = todoItemVars.baseH;
    this.s = todoItemVars.baseS;
    this.l = todoItemVars.baseL;
  }

  _render() {
    this.el = `
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
    `;
    this.htmlEl.push(this.el);
    this.lineStyle = this.htmlEl.querySelectorAll(".line")[0].style;
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
}
