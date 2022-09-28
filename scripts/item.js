"use strict";

class Item {
  itemHeight = 62;

  constructor(data, listItem) {
    this.data = data;
    // this._render();
    if (listItem) {
      this._updateCount();
    }
    this._render();
    // console.log("item el: " + this.el.innerHTML);
    console.log("check el: " + this.el);
    this.style = this.el.style;
    this.slider = this.el.querySelector(".slider");
    this.sliderStyle = this.slider.style;
    this.slider.style.backgroundColor = "gb(23, 128, 247)";
    // console.log("check first element: " + this.slider.innerHTML);
  }

  _updateCount() {
    this.count = 0;

    if (!this.data.items) this.data.items = [];

    this.data.items.forEach((item) => {
      if (!item.done) this.count++;
    });
  }
}
