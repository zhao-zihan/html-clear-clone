"use strict";

// if you get lost, put #debug in your url and refresh the page, app will use default data
const debug = window.location.hash.replace("#", "") === "debug";
const localStorageKey = "html-clear";

const states = {
  LIST_COLLECTION_VIEW: "lists",
  TODO_COLLECTION_VIEW: "todos",
};

const ITEM_HEIGHT = 62;

const itemContainer = document.querySelector(".wrapper");

const s = document.body.style;

const isTouch = "ontouchstart" in window;
const clientHeights = [window.innerHeight];

if (window.screen?.height) {
  clientHeights.push(window.screen?.height);
}

const clientHeight = Math.min(...clientHeights);

const transformProperty =
  "webkitTransform" in s
    ? "webkitTransform"
    : "mozTransform" in s
    ? "mozTransform"
    : "msTransform" in s
    ? "msTransform"
    : "transform";

const transitionEndEvent =
  transformProperty === "webkitTransform"
    ? "webkitTransitionEnd"
    : "transitionend";

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
// for converting long text directly to html element, equivalent to jQuery $();
const htmlToElements = function (html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild;
};

// for converting html element to text, use chrome debugger instead for better experience
const elementsToHTML = function (element) {
  let outer = document.createElement("div");
  outer.appendChild(element);
  return outer.innerHTML;
};

// for easy setting dataset-id directly on a newly created element, equivalent for jQuery $()
// for GOD's sake frameworks are way easier to use
const retrieveChild = function (element) {
  let div = document.createElement("div");
  div.appendChild(element);
  return div.firstElementChild;
};

const raf =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 16);
  };
