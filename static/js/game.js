import {TimeLoop} from "./modules/time-managers.js";
import {
  getRandomInt,
  getSquareForm,
  getDistanceFrom,
  getVectorFrom,
  foldPoints,
  convertToCssRGBA
} from "./modules/functions.js";


class Surface {
  setColorTo(point, color) {}

  setImageTo(point, imagePath) {}

  fill(color) {}

  get size() {}
}


class CanvasManager extends Surface {
  #canvas;
  #context;
  #backgroundColor;

  constructor(canvas, сellSize, backgroundColor=[255, 255, 255]) {
    super();
    this.canvas = canvas;
    this.сellSize = сellSize;
    this.backgroundColor = backgroundColor;
  }

  set canvas(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext("2d");
  }

  set backgroundColor(color) {
    this.#backgroundColor = convertToCssRGBA(color);
  }

  setColorTo(point, color) {
    this.#context.fillStyle = convertToCssRGBA(color);
    this.#context.fillRect(
      point[0]*this.сellSize[0],
      point[1]*this.сellSize[1],
      this.сellSize[0],
      this.сellSize[1]
    );
  }

  setImageTo(point, imagePath) {
    let image = new Image();
    image.src = imagePath;

    image.onload = () => {
      this.#context.drawImage(
        image,
        point[0]*this.сellSize[0],
        point[1]*this.сellSize[1],
        this.сellSize[0],
        this.сellSize[1]
      );
    }
  }

  fill(color) {
    this.#context.fillStyle = this.#backgroundColor;
    this.#context.fillRect(0, 0, ...this.size);
  }

  get size() {
    return [this.#canvas.clientWidth, this.#canvas.clientWidth];
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
    surface.fill();
    for (let i = 0; i < this.world.objects.length; i++) {
      this.renderObjectOnSurface(surface, this.world.objects[i]);
    }
  }

  renderObjectOnSurface(surface, object) {
    for (let i = 0; i < object.parts.length; i++) {
      if (object.parts[i].color != undefined)
        surface.setColorTo(object.parts[i].point, object.parts[i].color)
    }
  }
}


class World extends Timer {
  constructor(timeLoop) {
    super();
    this.time = timeLoop;
    this.objects = [];
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
    this.reactionToWorld();
    this.internalProcesses();
  }

  reactionToWorld() {
    for (let i = 0; i < this.world.objects.length; i++) {
      if (this != this.world.objects[i])
        this.reactionToObject(this.world.objects[i]);
    }
  }

  reactionToObject(object) {
    for (let i = 0; i < object.parts.length; i++) {
      this.reactionToPart(object.parts[i]);
    }
  }

  reactionToPart(part) {}

  internalProcesses() {
    this.stateProcess();
  }

  stateProcess() {};

  die() {
    this.isAlive = false;
  }
}


class GameObject extends GameElement {
  #world;

  constructor(world) {
    super();
    this.world = world;
    this.parts = [];
  }

  get world() {
    return this.#world;
  }

  set world(world) {
    if (this.#world != undefined)
      this.#world.objects.splice(this.#world.objects.findIndex(this), 1);

    this.#world = world;
    this.#world.objects.push(this);
  }

  initializeParts() {
    this.killParts();
  }

  killParts() {
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].die();
    }
  }

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
    this.killParts();

    this.world = undefined;
  }

  static createWrapperFor(part, world) {
    let wrapper = new GameObject(world);
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
    this.#previousPoint = Array.from(this.#point);
    this.#point = point;
  }

  move(vector) {
    this.teleportTo(foldPoints(this.point, vector));
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

  get world() {
    if (this.master != undefined)
      return this.master.world;
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
    super.initializeParts();

    this.parts = [];
    for (let i = 0; i < points.length; i++) {
      this.parts.push(new classOfPart(points[i], this));
    }
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
      activeDistance = getDistanceFrom(point, points[i]);
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
}


class GameZone extends Zone {
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
}


class Snake extends GameObject {
  constructor(world, step=1) {
    super(world);
    this.step = step;
  }

  initializeParts(head, tailClass, tailsNumber) {
    super.initializeParts();

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
    if (this.head.direction.join() == this.head.direction.map(number => 0).join()) return;

    for (let tact = 0; tact < this.step; tact++) {
      this.head.move(this.head.direction);

      for (let i = 1; i < this.parts.length; i++) {
        this.parts[i].move(getVectorFrom(this.parts[i].point, this.parts[i - 1].previousPoint));
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
    let newPoint = this.escapePoints[getRandomInt(0, this.escapePoints.length - 1)];

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


const theWorld = new World(new TimeLoop(1000));

GameObject.createWrapperFor(new Eggplant([15, 12], getSquareForm(26)), theWorld);

const snakeHead = new SnakeHead([12, 12]);
new Snake(theWorld).initializeParts(snakeHead, SnakeTail, 2);

document.addEventListener('keydown', (event) => {
  if (event.code == 'KeyD' && snakeHead.direction.join() != [-1, 0].join())
    snakeHead.direction = [1, 0];
  else if (event.code == 'KeyA' && snakeHead.direction.join() != [1, 0].join())
    snakeHead.direction = [-1, 0];
  else if (event.code == 'KeyW' && snakeHead.direction.join() != [0, 1].join())
    snakeHead.direction = [0, -1];
  else if (event.code == 'KeyS' && snakeHead.direction.join() != [0, -1].join())
    snakeHead.direction = [0, 1];
});

new GameZone(theWorld).initializeParts(getSquareForm(26));

new Renderer (
  theWorld,
  [new CanvasManager(document.getElementById("main-surface"), [20, 20])],
  new TimeLoop(500)
).time.start();

theWorld.time.start();
