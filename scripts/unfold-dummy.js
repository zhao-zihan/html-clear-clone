class UnfoldDummy extends Item {
  constructor(options) {
    this.el = htmlToElements(`
    <div class="item unfold-dummy">
        <div class="inner">
            <div class="unfold top">
                <div class="item" style="padding-left: 12px"></div>
            </div>
            <div class="unfold bot">
                <div class="item" style="padding-left: 12px"></div>
            </div>
        </div>`);
    this.style = this.el.style;

    this.top = this.el.querySelector(".top");
    this.bot = this.el.querySelector(".bot");
    this.content = this.el.querySelector(".item");

    if (options.content) {
      this.content.innerText = options.content;
    }

    this.content.style.backgroundColor = options.color;
    this._moveY((options.order - 1) * ITEM_HEIGHT - 1);
  }
}
