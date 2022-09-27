"use strict";

class App {
  constructor() {
    this._init();
  }

  _init() {
    this.data = mock.data;
    console.log(this.data);

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

    console.log(this.currentCollection);

    // this.currentCollection._load(0, true);

    if (!this.currentCollection.initiated) {
      this.currentCollection._load();
    }
  }
}

const app = new App();
