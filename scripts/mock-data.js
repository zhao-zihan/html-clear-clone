const localStorageKey = "html-clear";

const states = {
  LIST_COLLECTION_VIEW: "lists",
  TODO_COLLECTION_VIEW: "todos",
};

const itemContainer = document.querySelector(".wrapper");

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
const htmlToElements = function (html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild;
};

const elementsToHTML = function (element) {
  let outer = document.createElement("div");
  outer.appendChild(element);
  return outer.innerHTML;
};

const retrieveChild = function (element) {
  let div = document.createElement("div");
  div.appendChild(element);
  return div.firstElementChild;
};

class Mock {
  constructor() {
    this._init();
  }

  _init() {
    const raw = localStorage.getItem(localStorageKey);

    if (raw) {
      this.data = JSON.parse(raw);

      if (!this.data) {
        this._useDefaultData();
      } else {
        console.log("using stored data");
      }
    } else {
      this._useDefaultData();
    }
  }

  _save() {
    const raw = JSON.stringify(this.data);
    localStorage.setItem(localStorageKey, raw);
  }

  _useDefaultData() {
    console.log("using default data");

    this.data = {
      state: {
        view: states.LIST_COLLECTION_VIEW,
      },

      items: [
        {
          title: "How to Use",
          order: 0,
          items: [
            {
              order: 0,
              title: "Swipe right to complete",
            },
            {
              order: 1,
              title: "Swipe left to delete",
            },
            {
              order: 2,
              title: "Tap to edit",
            },
            {
              order: 3,
              title: "Long tap to reorder",
            },
            {
              order: 4,
              title: "Pull down to create new items",
            },
            {
              order: 5,
              title: "Or tap in empty space below",
            },
            {
              order: 6,
              title: "Pull down more to go back",
            },
            {
              order: 7,
              title: "Pull up to clear",
            },
            {
              order: 8,
              title: "Pinch is still WIP",
            },
          ],
        },
        {
          title: "This is a demo",
          order: 1,
          items: [
            {
              order: 0,
              title: "Learn Node.js",
            },
            {
              order: 1,
              title: "Grind leetcode",
            },
            {
              order: 2,
              title: "Play Codewars",
            },
            {
              order: 3,
              title: "Learn to use vim",
            },
            {
              order: 4,
              title: "Land a job",
            },
            {
              order: 5,
              title: "Visit friends",
            },
          ],
        },
      ],
    };
  }
}

const mock = new Mock();
