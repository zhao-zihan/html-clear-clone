"use strict";

class App {
  constructor() {
    this.isEditing = false;
    this._init();
  }

  _init() {
    pub.init();

    this.data = mock.data;

    const state = this.data.state;
    const lists = this.data.items;
    let i = lists.length;

    switch (state.view) {
      case states.LIST_COLLECTION_VIEW:
        console.log("init at list collection");
        this.currentCollection = new ListCollection(this.data);
        break;

      case states.TODO_COLLECTION_VIEW:
        console.log("init at todo collection with order: " + state.order);
        while (i--) {
          if (lists[i].order === state.order) {
            this.currentCollection = new TodoCollection(lists[i]);
            break;
          }
        }
        break;

      default:
        console.log("default init at list collection");
        this.currentCollection = new ListCollection();
        break;
    }

    // console.log(this.currentCollection);

    // this.currentCollection._load(0, true);

    if (!this.currentCollection.initiated) {
      this.currentCollection._load();
    }
  }

  _setCurrentCollection(col) {
    this.currentCollection = col;

    let state = mock.data.state;
    state.view = col.stateType;
    state.order = col.data.order;
    mock._save();
  }
}

const app = new App();
