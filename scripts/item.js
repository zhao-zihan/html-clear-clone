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
    console.log("check el: " + elementsToHTML(this.el));
    this._selectStyle();
    // console.log("check first element: " + this.slider.innerHTML);

    this._addImage();

    this.title = this.el.querySelector(".title");
    this.field = this.el.querySelector(".field");
    console.log("check this.field " + elementsToHTML(this.field));
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

  _updateCount() {
    this.count = 0;

    if (!this.data.items) this.data.items = [];

    this.data.items.forEach((item) => {
      if (!item.done) this.count++;
    });
  }
}
