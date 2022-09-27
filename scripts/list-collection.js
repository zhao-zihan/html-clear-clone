"use strict";

class ListCollection extends Collection {
  constructor(data) {
    console.log("arguments in lc constructor" + data);
    super(data);
    this.stateType = states.LIST_COLLECTION_VIEW;
    this.itemType = function (data) {
      return new ListItem(data);
    };
    this.itemTypeText = "List";

    this._render();
    this._populateItems();
    this._updateColor();
  }

  _render() {
    this.el = htmlToElements(`
      <div id="list-collection" class="collection">
          <div class="credit">Made by Zihan Zhao <br> Inspired by Evan You</div>
              <div class="item dummy-item top list-item empty">
                  <div class="slider" style="background-color:rgb(23,128,247)">
                    <div class="inner">
                      <span class="title">Pull to Create List</span>
                      <div class="count">0</div>
                    </div>
              </div>
          </div>
      </div>`);
    this.style = this.el.style;
  }

  _load() {
    this.initiated = true;
    itemContainer.insertAdjacentHTML("afterend", this.el.innerHTML);
  }
}
