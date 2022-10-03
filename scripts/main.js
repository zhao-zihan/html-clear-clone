"use strict";

class App {
  constructor() {
    this.isEditing = false;
    this._init();
  }

  _init() {
    pub.init();

    this.data = mock.data;
    this.listCollection = new ListCollection(this.data);

    const state = this.data.state;
    const lists = this.data.items;
    let i = lists.length;

    switch (state.view) {
      case states.LIST_s_VIEW:
        console.log("init at list collection");
        this.currentCollection = this.listCollection;
        break;

      case states.TODO_COLLECTION_VIEW:
        console.log("init at todo collection with order: " + state.order);
        while (i--) {
          if (lists[i].order === state.order) {
            const listItem = this.listCollection._getItemByOrder(
              lists[i].order
            );
            this.currentCollection = new TodoCollection(lists[i], listItem);
            break;
          }
        }
        break;

      default:
        console.log("default init at list collection");
        this.currentCollection = this.listCollection;
        break;
    }

    // console.log(this.currentCollection);

    this.currentCollection._load(0, true);

    // if (this.currentCollection.itemTypeText === "Item") {
    //   this.listCollection = new ListCollection(this.data);
    //   // this.listCollection._load();
    // } else {
    //   this.listCollection = this.currentCollection;
    //   const listItem = this.listCollection._getItemByOrder(
    //     lists[state.lastTodoCollection || 0].order
    //   );
    //   this.lastTodoCollection = new TodoCollection(
    //     lists[state.lastTodoCollection || 0],
    //     listItem
    //   );
    //   this.currentCollection._load();
    // }

    if (!this.listCollection.initiated) {
      this.listCollection._positionForPullDown();
      this.listCollection._load();
    } else {
      const listItem = this.listCollection._getItemByOrder(
        lists[state.lastTodoCollection || 0].order
      );
      this.lastTodoCollection = new TodoCollection(
        lists[state.lastTodoCollection || 0],
        listItem
      );
      this.lastTodoCollection._load(clientHeight + ITEM_HEIGHT, true);
      this.lastTodoCollection._positionForPullUp();
    }
  }

  _setCurrentCollection(col) {
    this.currentCollection = col;

    let state = mock.data.state;
    state.view = col.stateType;
    state.order = col.data.order;
    mock._save();
  }

  _setLastTodoCollection(col) {
    this.lastTodoCollection = col;
    mock.data.state.lastTodoCollection = col.data.order;
    mock._save();
  }
}

const app = new App();
