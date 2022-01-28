import {Space} from "./modules/multidimensional-pseudo-arrays.js";
import {HtmlSurface} from "./modules/html-managers.js";
import {TimeLoop} from "./modules/time-managers.js";
import {getRandomInt} from "./modules/functions.js";


class HtmlWindow extends HtmlSurface {
  constructor(className, dom, blockSurfaceClass, blockClassName, backgoundColor=[255, 255, 255]) {
    super(className, dom);
    this.backgoundColor = backgoundColor;
    this.allocateBlocks(blockSurfaceClass, blockClassName);
  }

  renderPoint(point, color) {
    this.blocks.getFrom(point).color = color;
  }

  paintOver(color) {
    if (color == undefined) {
      color = this.backgoundColor;
    }

    this.blocks.map(item => {item.color = color; return item});
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

  constructor(surfaces, timeLoop, objects) {
    this.surfaces = surfaces;
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
    this.reactionTo(this.processingObjects());
    this.render();
  }

  reactionTo(processes) {
    for (let i = 0; i < processes.length; i++) {
      if (processes[i] === undefined) {}

      else if ("break" === processes[i]) {
        this.time.stop();
      }
    }
  }

  processingObjects() {
    let resultsOfProcesses = [];
    let result;

    for (let i = 0; i < this.objects.length; i++) {
      result = this.objects[i].process();
      resultsOfProcesses.push(result);
    }

    return resultsOfProcesses;
  }

  render() {
    for (let i = 0; i < this.surfaces.length; i++) {
      this.#renderOnSurface(this.surfaces[i]);
    }
  }

  #renderOnSurface(surface) {
    surface.paintOver();
    for (let i = 0; i < this.objects.length; i++) {
      surface.renderPoint(this.objects[i].point, this.objects[i].color);
    }
  }
}


class GameElement {
  constructor() {
    this.isAlive = true;
  }

  process() {
    this.internalProcesses();
  }

  internalProcesses() {}

  die() {
    this.isAlive = false;
  }
}


class GameObject extends GameElement {
  static everything = [];

  constructor() {
    super();
    GameObject.everything.push(this);

    this.initParts();
  }

  initParts() {}

  internalProcesses() {
    this.processingParts();
    this.stateProcess();
  }

  processingParts() {
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].process();
    }
  }

  stateProcess() {}

  die() {
    super.die();
    GameObject.everything.splice(GameObject.everything.findIndex(this), 1);

    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].die();
    }
  }
}


class GameObjectPart extends GameElement {
  static defaultColor;

  #color;

  constructor(point, master, color) {
    super();
    this.point = point;
    this.direction = "rigth";
    this.color = color;

    this.master = master;
  }

  set color(color) {
    if (color == undefined) {
      this.#color = this.constructor.defaultColor;
    } else {
      this.#color = color;
    }
  }

  get color() {
    return this.#color;
  }

  move(direction) {}

  process() {
    this.reactionToWorld(GameObject.everything);
    super.process();
  }

  reactionToWorld(world) {
    for (let i = 0; i < world.length; i++) {
      if (this != world[i])
        this.reactionToObject(world[i]);
    }
  }

  reactionToObject(object) {}

  getRelativePositionFrom(object) {
    let differencePosition = getPositionDifferenceFrom(object);
  }

  getPositionDifferenceFrom(object) {
    let vector = [];
    for (let i = 0; i < this.point; i++) {
      vector.push(this.point[i] - object.point[i]);
    }

    return vector;
  }
}


class Snake extends GameObject {
  initParts(head, tailClass, tailsNumber) {
    this.head = head;
    this.parts = [head];

    this.tailClassDefault = tailClass;

    for (let i = 0; i < tailsNumber; i++) {
      this.addTail()
    }
  }

  addTail(tail) {
    if (tail == undefined) {
      tail = new this.tailClassDefault(this.head.point);
    }
  }

  stateProcess() {}
}


class SnakeHead extends GameObjectPart {
  static defaultColor = [252, 216, 78];

  reactionToObject(object) {
    if (object.point.join() == this.point.join()) {
      if (object instanceof Fruit) {
        new SnakeTail([this.point[0], this.point[1] + 1]); // test
      }
      else {
        this.die()
      }
    }
  }
}


class SnakeTail extends GameObjectPart {
  static defaultColor = [255, 224, 107];
}


class Fruit extends GameObjectPart {
  static defaultColor = [179, 39, 230];

  teleportToRandomPlace(range) {
    let newPoint = [];
    for (let i = 0; i < range.length; i++) {
      newPoint.push(getRandomInt(range[i]));
    }

    if (newPoint.join() == this.point.join())
      this.teleportToRandomPlace(range);
    else
      this.point = newPoint;
  }

  reactionToObject(object) {
    if (object.point.join() == this.point.join()) {
      this.teleportToRandomPlace([26, 26]);
    }
  }
}


new Game (
  [new HtmlWindow("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell")],
  new TimeLoop(1000),
  GameObject.everything
).time.start();
