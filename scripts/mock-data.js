App.mock = (function () {
  const localStorageKey = "html-clear";

  const mock = {
    init() {
      const storedData = localStorage.getItem(localStorageKey);

      if (storedData) {
        console.log("Mock this: " + this);
        this.data = JSON.parse(storedData);

        if (!this.data) {
          this.useDefaultData();
        } else {
          console.log("App using stored data");
        }
      } else {
        this.useDefaultData();
      }
    },

    saveData() {
      const storedData = JSON.stringify(this.data);
      localStorage.setItem(localStorageKey, storedData);
    },

    useDefaultData() {
      this.data = {
        state: {
          view: App.states.LIST_COLLECTION_VIEW,
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
    },
  };

  return mock;
})();
