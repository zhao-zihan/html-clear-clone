"use strict";

class Item {
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

  _updateCount() {
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

    // this.collection._onEditStart(this.data.order, noRemember);
  }

  _onEditDone() {
    const t = this;
  }
}
