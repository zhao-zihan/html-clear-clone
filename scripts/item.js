"use strict";

class Item {
  itemHeight = 62;

  constructor(data) {
    this.data = data;
    this.htmlEl = [];
    this.style = this.htmlEl[0].style;
    this.slider = this.htmlEl.querySelectorAll(".slider");
    this.sliderStyle = this.slider[0].style;
  }
}
