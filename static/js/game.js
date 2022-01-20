import {Space} from "./modules/multidimensional-pseudo-arrays.js";
import {HtmlSurface} from "./modules/html-managers.js";
import {TimeLoop} from "./modules/time-managers.js";


class HtmlWindow extends HtmlSurface {
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


class Game {
  #time;

  constructor(window, timeLoop, objects) {
    this.window = window;
    this.time = timeLoop;
    this.objects = objects;
  }

  set time(timeLoop) {
    this.#time = timeLoop;
    this.time.stop();
    let that = this;
    this.time.action = () => {that.process()};
  }

  get time() {
    return this.#time;
  }

  process() {
    let results = this.processingObjects();
    this.reactionTo(results);
  }

  reactionTo(processes) {
    if ("stop the time" in processes)
      this.time.stop();
  }

  processingObjects() {
    let resultsOfProcesses = [];
    let result;

    for (let i = 0; i < this.objects.length; i++) {
      result = this.objects[i].process();
      resultsOfProcesses.push(this.objects[i], result);
    }

    return resultsOfProcesses;
  }
}


new Game(
  new HtmlWindow("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell"),
  new TimeLoop(2000),
  []
).time.start();
