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

  reactionToObject(object) {
    for (let i = 0; i < object.parts.length; i++) {
      this.reactionToPart(object.parts[i]);
    }
  }

  reactionToPart(part) {}

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

  teleportTo(point) {
    this.#previousPoint = this.#point;
    this.#point = point;
  }

  move(vector) {
    this.#previousPoint = Array.from(this.#point);

    for (let i = 0; i < vector.length; i++) {
      this.#point[i] += vector[i];
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

  reactionToPart(part) {
    if (!(part instanceof Background || this == part)) {
      if (this.point.join() == part.point.join())
        this.reactionToCellmate(part);
    }
  }

  reactionToCellmate(cellmate) {}
}


class Background extends GameObjectPart {}


class Zone extends GameObject {
  initializeParts(points, classOfPart=Background) {
    this.parts = [];
    for (let i = 0; i < points.length; i++) {
      this.parts.push(new classOfPart(points[i], this));
    }
  }

  reactionToPart(part) {
    if (!this.isPointWithinBorders(part.point))
      part.teleportTo(this.changePoint(part.point));
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
    this.tailClassDefault = tailClass;

    this.head = head;
    this.head.master = this;
    this.head.direction = [1];
    this.parts = [head];

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
    tail.teleportTo(this.parts[this.parts.length - 1].previousPoint);
    this.parts.push(tail);
  }

  stateProcess() {
    this.moveParts();
  }

  moveParts() {
    for (let tact = 0; tact < this.step; tact++) {
      this.head.move(this.head.direction);

      for (let i = 1; i < this.parts.length; i++) {
        this.parts[i].teleportTo(this.parts[i - 1].previousPoint);
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


class Fugitive extends GameObjectPart {
  constructor(point, escapePoints, master, color) {
    super(point, master, color);
    this.escapePoints = escapePoints;
  }

  runAway() {
    let newPoint = this.escapePoints[getRandomInt(this.escapePoints.length - 1)];

    if (this.point.join() == newPoint.join())
      this.runAway();
    else
      this.teleportTo(newPoint);
  }

  reactionToCellmate(cellmate) {
    this.runAway();
  }
}


class Eggplant extends Fugitive {
  static defaultColor = [179, 39, 230];
}


GameObject.createWrapperFor(new Eggplant([3, 0], getSquareForm(26)));

const snake = new Snake();
snake.initializeParts(new SnakeHead([2, 0]), SnakeTail, 2);

const wall = new Zone();
wall.initializeParts(getSquareForm(26));

const render = new Renderer(
  new World(GameObject.everything, new TimeLoop(1000)),
  [new HtmlWindow("game-window", document.getElementsByTagName("main")[0], HtmlSurface, "game-cell")],
  new TimeLoop(100)
)

render.time.start();
render.world.time.start();
