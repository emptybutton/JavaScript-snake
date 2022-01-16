import {Space} from "./modules/multidimensional-pseudo-arrays.js";
import {HtmlSurface} from "./modules/html-managers.js";
import {functionStructuring, activateEverybodyFrom} from "./modules/functions.js";


class Window extends HtmlSurface {
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


new Window("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell");
