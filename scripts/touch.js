class TouchData {
  constructor(e) {
    this.id = e.identifier || "mouse";

    this.ox = this.cx = e.pageX;
    this.oy = this.cy = e.pageY;

    this.dx = this.dy = 0;

    this.tdx = this.tdy = 0;

    this.ot = this.ct = Date.now();

    this.dt = 0;

    const targetItemNode = getParentItem(e.target);
    if (targetItemNode) {
      this.targetItem = app.currentCollection._getItemById(
        +targetItemNode.dataset.id
      );
    }

    this.moved = false;
  }

  _update(e) {
    this.moved = true;

    this.dx = e.pageX - this.cx;
    this.cx = e.pageX;

    this.dy = e.pageY - this.cy;
    this.cy = e.pageY;

    this.tdx = this.cx - this.ox;
    this.tdy = this.cy - this.oy;

    const now = Date.now();
    this.dt = now - this.ct;
    this.ct = now;
  }
}

const touches = [];
let currentAction;
const pinchData = {
  od: null,
  cd: null,
  delta: null,

  init() {
    this.od = Math.abs(touches[0].cy - touches[1].cy);
  },

  update() {
    this.cd = Math.abs(touches[0].cy - touches[1].cy);
    this.delta = this.cd - this.od;
  },

  reset() {
    this.od = null;
    this.cd = null;
  },
};

const t = isTouch;

const start = t ? "touchstart" : "mousedown";
const move = t ? "touchmove" : "mousemove";
const end = t ? "touchend" : "mouseup";

const dragThreshold = 20;

// let s = 0;

function initEvents() {
  itemContainer.addEventListener(start, function (e) {
    console.log("start is: " + start);
    if (app.isEditing) return;

    if (touches.length >= 2 || currentAction) return;

    pub.isDown = true;

    e = t ? e.changedTouches[0] : e;

    const touch = new TouchData(e);
    touches.push(touch);

    if (touches.length === 2) {
      pinchData.init();
    }

    if (touches.length === 1 && touches[0].targetItem) {
      actions.itemSort.startTimeout();
    }
  });

  itemContainer.addEventListener(move, function (e) {
    // console.log("mouse moved");
    if (app.isEditing) return;

    if (!touches.length) return;

    e = t ? e.changedTouches[0] : e;

    const i = getTouchIndex(e.identifier || "mouse");
    if (i !== -1) {
      touches[i]._update(e);
    } else {
      return;
    }

    if (touches.length === 2) {
      pinchData.update();
    }

    actions.itemSort.cancelTimeout();

    if (!currentAction) {
      if (touches.length === 1) {
        actions.collectionDrag.check();
        actions.itemDrag.check();
      } else {
        actions.pinchIn.check();
        actions.pinchOut.check();
      }
    } else {
      actions[currentAction].move(i);
      // console.log("current action: " + currentAction);
    }
  });

  itemContainer.addEventListener(end, function (e) {
    if (app.isEditing) return;

    e = t ? e.changedTouches[0] : e;
    const id = e.identifier || "mouse";
    const i = getTouchIndex(id);

    if (i === -1) return;

    if (touches.length === 1) {
      pub.isDown = false;
    }

    actions.itemSort.cancelTimeout();

    if (!currentAction) {
      if (!touches[0].moved && !app.currentCollection.inMomentum) {
        if (touches[0].targetItem) {
          actions.itemTap.trigger(e);
        } else {
          actions.collectionTap.trigger(e);
        }
      }
    } else {
      actions[currentAction].end();
      if (touches.length === 1) {
        currentAction = null;
      }
    }

    touches.splice(i, 1);
    pinchData.reset();
  });
}

const actions = {
  collectionDrag: {
    check() {
      if (Math.abs(touches[0].tdy) > dragThreshold) {
        currentAction = "collectionDrag";
        app.currentCollection._onDragStart();
      }
    },

    move() {
      console.log("collection dragged");
      app.currentCollection._onDragMove(touches[0].dy);
    },

    end() {
      const speed = touches[0].dy / touches[0].dt;
      app.currentCollection._onDragEnd(speed);
    },
  },

  itemDrag: {
    check() {
      if (touches[0].targetItem && Math.abs(touches[0].tdx) > dragThreshold) {
        currentAction = "itemDrag";
        touches[0].targetItem._onDragStart();
      }
    },

    move() {
      touches[0].targetItem._onDragMove(touches[0].dx);
    },

    end() {
      touches[0].targetItem._onDragEnd();
    },
  },

  itemSort: {
    timeOut: null,
    delay: 500,

    startTimeout() {
      this.timeOut = setTimeout(function () {
        actions.itemSort.trigger();
      }, this.delay);
    },

    move() {
      touches[0].targetItem._onSortMove(touches[0].dy);
    },

    end() {
      this.cancelTimeout();
      touches[0].targetItem._onSortEnd();
    },

    trigger() {
      this.timeOut = null;
      if (currentAction) return;
      currentAction = "itemSort";
      touches[0].targetItem._onSortStart();
    },

    cancelTimeout() {
      if (this.timeOut) {
        clearTimeout(this.timeOut);
        this.timeOut = null;
      }
    },
  },

  pinchIn: {
    check() {
      if (app.currentCollection.stateType === states.LIST_COLLECTION_VIEW)
        return;

      if (pinchData.delta < -dragThreshold) {
        currentAction = "pinchIn";
        app.currentCollection._onPinchInStart();
      }
    },

    move(i) {
      if (touches.length === 1) return;

      const touch = touches[i];
      app.currentCollection._onPinchInMove(i, touch);
    },

    end() {
      if (touches.length === 1) return;

      if (pinchData.cd <= pinchData.od * 0.5) {
        app.currentCollection._onPinchInEnd();
      } else {
        app.currentCollection._onPinchInCancel();
      }
    },
  },

  // pinchOut: {
  //   at: null,

  //   check() {
  //     if (pinchData.delta > dragThreshold) {
  //       currentAction = "pinchOut";
  //       app.currentCollection._onPinchOutStart();
  //     }
  //   },

  //   move(i) {
  //     if (touches.length === 1) return;

  //     const touch = touches[i];
  //     app.currentCollection._onPinchOutMove(i, touch);
  //   },

  //   end() {
  //     if (touches.length === 1) return;

  //     if (pinchData.delta > ITEM_HEIGHT) {
  //       app.currentCollection._onPinchOutEnd();
  //     } else {
  //       app.currentCollection._onPinchOutCancel();
  //     }
  //   },
  // },

  itemTap: {
    trigger(e) {
      touches[0].targetItem._onTap(e);
    },
  },

  collectionTap: {
    trigger() {
      app.currentCollection._onTap();
    },
  },
};

function getTouchIndex(id) {
  let i = -1;
  touches.forEach((item, index) => {
    if (item.id === id) {
      i = index;
    }
  });
  return i;
}

function getParentItem(node) {
  while (node) {
    if (node.className && node.className.match(/\bitem\b/)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

const pub = {
  init() {
    console.log("Touch: init");

    // https:stackoverflow.com/questions/42101723/unable-to-preventdefault-inside-passive-event-listener
    document.body.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );

    initEvents();
  },
};
