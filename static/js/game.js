import {Space} from "./modules/multidimensional-pseudo-arrays.js";
import {HtmlSurface} from "./modules/html-managers.js";
import {TimeLoop} from "./modules/time-managers.js";
import {getRandomInt, getSquareForm} from "./modules/functions.js";


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
      if (object.parts[i].color != undefined)
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
    this.reactionToWorld(GameObject.everything);
    this.internalProcesses();
  }

  reactionToWorld(world) {
    for (let i = 0; i < world.length; i++) {
      if (this != world[i])
        this.reactionToObject(world[i]);
    }
  }

  reactionToObject(object) {}

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
    this.parts = [];
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

  static createWrapperFor(part) {
    let wrapper = new GameObject();
    wrapper.parts = [part];
    part.master = wrapper;

    return wrapper;
  }
}


class GameObjectPart extends GameElement {
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
    if (Array.isArray(this.#color))
      return Array.from(this.#color);
    else
      return this.#color;
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
}


class Zone extends GameObject {
  initializeParts(points, classOfPart) {
    this.parts = [];
    for (let i = 0; i < points.length; i++) {
      this.parts.push(new classOfPart(points[i], this));
    }
  }

  reactionToObject(object) {
    this.changePositionOf(object);
  }

  changePositionOf(...objects) {
    for (let i = 0; i < objects.length; i++) {
      this.changeParts(objects[i].parts);
    }
  }

  changeParts(parts) {
    for (let i = 0; i < parts.length; i++) {
      if (!this.isPointWithinBorders(parts[i].point))
        parts[i].moveToPoint(this.changePoint(parts[i].point));
    }
  }

  changePoint(point) {
    for (let i = 0; i < point.length; i++) {
      let locationRange = this.getLocationRange(point, i);

      if (locationRange.join() == locationRange.map(item => undefined))
        locationRange = this.getLocationRange(this.getNearestPointFrom(point), i);

      if (point[i] < locationRange[0][i]) {
        point[i] = locationRange[1][i];
      }

      else if (point[i] > locationRange[1][i]) {
        point[i] = locationRange[0][i];
      }
    }

    return point;
  }

  isPointWithinBorders(point) {
    let myPoints = this.parts.map(part => part.point);
    for (let i = 0; i < myPoints.length; i++) {
      if (point.join() == myPoints[i].join())
        return true;
    }

    return false;
  }

  getNearestPointFrom(point) {
    let nearestPoint;
    let points = this.parts.map(part => part.point);
    let minDistance = Infinity;
    let activeDistance;

    for (let i = 0; i < points.length; i++) {
      activeDistance = this.#getDistanceFrom(point, points[i]);
      if (activeDistance < minDistance) {
        nearestPoint = points[i];
        minDistance = activeDistance;
      }
    }

    return nearestPoint;
  }

  getLocationRange(referencePoint, axis) {
    let points = this.getLocationAlongAxis(referencePoint, axis);

    points.sort((first, second) => {
      if (first[axis] > second[axis]) return 1;
      else if (first[axis] == second[axis]) return 0;
      else return -1;
    });

    return [points[0], points[points.length - 1]];
  }

  getLocationAlongAxis(referencePoint, axis) {
    let points = this.parts.map(part => part.point);
    let clearedReferencePoint = this.#getClearedPointFromAxis(referencePoint, axis);

    let satisfyingPoints = [];
    for (let i = 0; i < points.length; i++) {
      if (this.#getClearedPointFromAxis(points[i], axis).join() == clearedReferencePoint.join())
        satisfyingPoints.push(points[i]);
    }

    return satisfyingPoints;
  }

  #getClearedPointFromAxis(point, axis) {
    point = Array.from(point);
    point[axis] = null;

    return point;
  }

  #getDistanceFrom(firstPoint, secondPoint) {
    return Math.sqrt(this.#getVectorFrom(firstPoint, secondPoint).map(coordinate => coordinate**2).reduce((sum, elem) => sum + elem, 0));
  }

  #getVectorFrom(startPoint, endPoint) {
    let vector = [];
    for (let i = 0; i < startPoint.length; i++) {
      vector.push(endPoint[i] - startPoint[i]);
    }

    return vector;
  }
}


class Snake extends GameObject { //DO IT
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


class Tile extends GameObjectPart {
  static defaultColor = [255, 255, 168];
}

/*console.log();
const snake = new Snake();
snake.initializeParts(new SnakeHead([0, 0]), SnakeTail, 0);
*/

let wall = new Zone();
wall.initializeParts(getSquareForm(4), GameObjectPart);

let megaMen = new SnakeTail([0, 0]);
GameObject.createWrapperFor(megaMen);



setInterval(_ => {megaMen.moveInVector([1])}, 1000); // for the test

const render = new Renderer(
  new World(GameObject.everything, new TimeLoop(1000)),
  [new HtmlWindow("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell")],
  new TimeLoop(500)
)

render.time.start();
render.world.time.start();
