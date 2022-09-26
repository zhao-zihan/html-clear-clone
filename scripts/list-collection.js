"use strict";

class ListCollection extends Collection {
  constructor() {
    super();
    this.stateType = states.LIST_COLLECTION_VIEW;
    this.itemType = function () {
      return new ListItem(arguments);
    };
    this.itemTypeText = "List";

    this._updateColor();
  }
}
