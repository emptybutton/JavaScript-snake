import {Space} from "./modules/multidimensional-pseudo-arrays.js";
import {HtmlSurface} from "./modules/html-managers.js";
import {TimeLoop} from "./modules/time-managers.js";
import {getRandomInt} from "./modules/functions.js";


class HtmlWindow extends HtmlSurface { // test
  constructor(className, dom, blockSurfaceClass, blockClassName, backgoundColor=[255, 255, 255]) {
    super(className, dom);
    this.backgoundColor = backgoundColor;
    this.allocateBlocks(blockSurfaceClass, blockClassName);
  }

  renderPoint(point, color) {
    if (this.blocks.withinSize(point))
      this.blocks.getFrom(point).color = color;
  }

  paintOver(color) {
    if (color == undefined) {
      color = this.backgoundColor;
    }

    this.blocks.prism(item => {item.color = color; return item});
  }

  allocateBlocks(blockSurfaceClass, blockClassName) {
    let testBlocks = new blockSurfaceClass(blockClassName, this.htmlObject);
    let blockSize = testBlocks.size;
    this.clearHtmlChildren();

    this.blocks = new Space([this.size[0]/blockSize[0], this.size[1]/blockSize[1]]);

    this.blocks.prism(_ => new blockSurfaceClass(blockClassName, this.htmlObject));
  }
}


class Timer {
  #time;

  process() {}

  set time(timeLoop) {
    this.#time = timeLoop;
    this.#time.stop();
    let that = this;
    this.#time.action = () => {that.process()};
  }

  get time() {
    return this.#time;
  }
}


class Renderer extends Timer {
  constructor(world, surfaces, timeLoop) {
    super();
    this.world = world;
    this.time = timeLoop;
    this.surfaces = surfaces;
  }

  process() {
    this.render();
  }

  render() {
    for (let i = 0; i < this.surfaces.length; i++) {
      this.renderOnSurface(this.surfaces[i]);
    }
  }

  renderOnSurface(surface) {
    surface.paintOver();
    for (let i = 0; i < this.world.objects.length; i++) {
      this.renderObjectOnSurface(surface, this.world.objects[i]);
    }
  }

  renderObjectOnSurface(surface, object) {
    for (let i = 0; i < object.parts.length; i++) {
      surface.renderPoint(object.parts[i].point, object.parts[i].color)
    }
  }
}


class World extends Timer {
  constructor(objects, timeLoop) {
    super();
    this.time = timeLoop;
    this.objects = objects;
  }

  process() {
    this.reactionTo(this.processingObjects());
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
  }

  initializeParts() {}

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


class GameObjectPart extends GameElement { // big ass
  static defaultColor;

  #color;
  #point;
  #direction;
  #previousPoint;

  constructor(point, master, color) {
    super();
    this.#point = Array.from(point);
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
    return Array.from(this.#color);
  }

  moveToPoint(point) {
    this.#previousPoint = this.#point;
    this.#point = point;

    this.direction = this.lastPointChanges;
  }

  moveInVector(vector) {
    this.#previousPoint = Array.from(this.#point);

    for (let i = 0; i < this.#point.length; i++) {
      if (i < vector.length) {
        this.#point[i] += vector[i];
      }
    }

    this.direction = this.lastPointChanges;
  }

  get point() {
    return Array.from(this.#point);
  }

  get previousPoint() {
    return Array.from(this.#previousPoint);
  }

  get direction() {
    return Array.from(this.#direction);
  }

  set direction(vector) {
    this.#direction = vector.map(coordinate => Math.sign(coordinate));
  }

  get lastPointChanges() {
    let lastChanges = [];
    for (let i = 0; i < this.#point.length; i++) {
      lastChanges.push(this.#point[i] - this.#previousPoint[i]);
    }

    return lastChanges;
  }

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
}


class Snake extends GameObject {
  constructor(step=1) {
    super();
    this.step = step;
  }

  initializeParts(head, tailClass, tailsNumber) {
    this.head = head;
    this.head.master = this;
    this.head.direction = [1];
    this.parts = [head];

    this.tailClassDefault = tailClass;

    let nextPoint;
    for (let i = 0; i < tailsNumber; i++) {
      nextPoint = this.parts[this.parts.length - 1].point;
      nextPoint[0]--;

      this.parts.push(new this.tailClassDefault(nextPoint, this));
    }
  }

  addTail(tail) {
    if (tail == undefined) {
      tail = new this.tailClassDefault(this.head.point);
    }

    tail.tail.master = this;
    tail.moveToPoint(this.parts[this.parts.length - 1].previousPoint);
    this.parts.push(tail);
  }

  stateProcess() {
    this.move();
  }

  move() {
    for (let _ = 0; _ < this.step; _++) {
      this.head.moveInVector(this.head.direction);

      for (let i = 1; i < this.parts.length; i++) {
        this.parts[i].moveToPoint(this.parts[i - 1].previousPoint);
      }
    }
  }

  get tails() {
    let tails = Array.from(this.parts);
    tails.splice(tails.indexOf(this.head), 1);

    return tails;
  }
}


class SnakeHead extends GameObjectPart {
  static defaultColor = [252, 216, 78];

  /*reactionToObject(object) {
    if (object.point.join() == this.point.join()) {
      if (object instanceof Fruit) {
        new SnakeTail([this.point[0], this.point[1] + 1]); // test
      }
      else {
        this.die()
      }
    }
  }*/
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


const snake = new Snake();
snake.initializeParts(new SnakeHead([-1, 0]), SnakeTail, 3);

setTimeout(_ => {snake.head.direction = [0, 1]}, 24000); // for the test

const render = new Renderer(
  new World(GameObject.everything, new TimeLoop(1000)),
  [new HtmlWindow("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell")],
  new TimeLoop(1000)
)

render.time.start();
render.world.time.start();
