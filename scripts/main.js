"use strict";

const itemContainer = document.querySelector(".wrapper");

class App {
  constructor() {
    this._init();
  }

  _init() {
    this.data = mock.data;

    const state = this.data.state;
    const lists = this.data.items;
    let i = lists.length;

    switch (state.view) {
      case states.LIST_COLLECTION_VIEW:
        console.log("init at list collection");
        this.currentCollection = new ListCollection();
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

    this.currentCollection.load(0, true);
  }
}

const app = new App();
