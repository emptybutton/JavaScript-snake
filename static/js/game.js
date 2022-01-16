import {Space} from "./modules/multidimensional-pseudo-arrays.js";


class HtmlManager {
  constructor(className, dom) {
    this.htmlObject = this.createHtmlObject(className);
    dom.appendChild(this.htmlObject);
  }

  clearHtmlChildren() {
    while (this.htmlObject.firstChild) {
      this.htmlObject.removeChild(this.htmlObject.firstChild);
    }
  }

  createHtmlObject(className) {
    let element = document.createElement("div");
    element.className = className;

    return element;
  }

  get size() {
    return [this.htmlObject.clientWidth, this.htmlObject.clientWidth];
  }
}


class Window extends HtmlManager {
  constructor(className, dom, blockSurfaceClass, blockClassName) {
    super(className, dom);
    this.allocateBlocks(blockSurfaceClass, blockClassName);
  }

  allocateBlocks(blockSurfaceClass, blockClassName) {
    let testBlocks = new blockSurfaceClass(blockClassName, this.htmlObject);
    let blockSize = testBlocks.size;
    this.clearHtmlChildren();

    this.blocks = new Space([this.size[0]/blockSize[0], this.size[1]/blockSize[1]]);

    this.blocks.map(_ => new blockSurfaceClass(blockClassName, this.htmlObject));
  }
}


class GameLoop {
  constructor(gameSurface) {
    this.surface = gameSurface;
  }
}


new Window("game-window", document.getElementsByTagName("main")[0], HtmlManager, "game-cell");
