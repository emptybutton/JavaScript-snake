import {convertToCssRGBA} from "./functions.js";


export class HtmlInterface {
  clearHtmlChildren() {
    while (this.htmlObject.firstChild) {
      this.htmlObject.removeChild(this.htmlObject.firstChild);
    }
  }

  createHtmlObject(className, tagName) {
    let element = document.createElement(tagName);
    element.className = className;

    return element;
  }
}


export class HtmlSurface extends HtmlInterface {
  constructor(className, dom) {
    super();
    this.htmlObject = this.createHtmlObject(className, "div");
    dom.appendChild(this.htmlObject);
  }

  get size() {
    return [this.htmlObject.clientWidth, this.htmlObject.clientWidth];
  }

  set color(color) {
    this.htmlObject.style.backgroundColor = convertToRGBA(color);
  }
}
