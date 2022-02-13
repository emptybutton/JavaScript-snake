import {TimeLoop} from "./time-managers.js";
import * as functions from "./functions.js";


export class Surface {
  setColorTo(point, color) {}

  setImageTo(point, imagePath) {}

  fill(color) {}

  get size() {}
}


export class CanvasManager extends Surface {
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
    this.#backgroundColor = functions.convertToCssRGBA(color);
  }

  setColorTo(point, color) {
    this.#context.fillStyle = functions.convertToCssRGBA(color);
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


export class Renderer extends Timer {
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
      this.renderAvatarOnSurface(surface, object.parts[i].point, object.parts[i].avatar);
    }
  }

  renderAvatarOnSurface(surface, point, avatar) {
    if (Array.isArray(avatar.pose))
      surface.setColorTo(point, avatar.pose);
    else if (avatar.pose == undefined)
      {}
    else
      surface.setImageTo(point, avatar.pose);
  }
}


export class Avatar {
  #activeSprite;

  constructor(sprites, master) {
    this.master = master;
    this.sprites = sprites;
  }

  get activeSprite() {
    return this.#activeSprite;
  }

  set activeSprite(sprite) {
    if (sprite != this.#activeSprite)
      sprite.phase = 0;

    this.#activeSprite = sprite
  }

  get pose() {
    this.activeSprite = this.getSpriteByMaster();
    if (this.activeSprite != undefined)
      return this.activeSprite.frame;
  }

  getSpriteByMaster() {
    return this.getSpritesByFlag("default")[0];
  }

  getSpritesByFlag(flag) {
    let sprites = [];
    for (let i = 0; i < this.sprites.length; i++) {
      if (JSON.stringify(this.sprites[i].flag) == JSON.stringify(flag))
        sprites.push(this.sprites[i]);
    }

    return sprites;
  }

  getSpritesByDirection(direction) {
    let sprites = [];
    for (let i = 0; i < this.sprites.length; i++) {
      if (JSON.stringify(this.sprites[i].direction) == JSON.stringify(direction))
        sprites.push(this.sprites[i]);
    }

    return sprites;
  }

  static createTestAvatar(color, master) {
    return new Avatar([new Sprite([color], "default")], master);
  }
}


export class Sprite {
  #phase = 0;

  constructor(frames, flag, direction) {
    this.flag = flag;
    this.direction = direction;
    this.frames = frames;
  }

  get frame() {
    return this.frames[this.#phase];
  }

  set phase(phase) {
    this.#phase = phase;

    if (this.#phase >= this.frames.length || this.#phase < 0)
      this.#phase = 0;
  }

  get phase() {
    return this.#phase;
  }
}


export class World extends Timer {
  constructor(timeLoop) {
    super();
    this.time = timeLoop;
    this.objects = [];
    this.additionalProcesses = [];
  }

  process() {
    this.reactionTo(this.processingObjects().concat(this.callAdditionalProcesses()));
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
    for (let i = 0; i < this.objects.length; i++) {
      resultsOfProcesses.push(this.objects[i].process());
    }

    return resultsOfProcesses;
  }

  callAdditionalProcesses() {
    let resultsOfProcesses = [];
    for (let i = 0; i < this.additionalProcesses.length; i++) {
      resultsOfProcesses.push(this.additionalProcesses[i]());
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


export class GameObject extends GameElement {
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


export class GameObjectPart extends GameElement {
  #avatar;
  #point;
  #direction;
  #previousPoint;

  constructor(point, master, avatar) {
    super();
    this.#point = Array.from(point);
    this.avatar = avatar;
    this.master = master;
  }

  static get defaultAvatar() {
    return Avatar.createTestAvatar();
  }

  set avatar(avatar) {
    if (avatar == undefined)
      avatar = this.constructor.defaultAvatar;

    this.#avatar = avatar;
    this.#avatar.master = this;
  }

  get avatar() {
    return this.#avatar;
  }

  teleportTo(point) {
    this.#previousPoint = Array.from(this.#point);
    this.#point = point;
  }

  move(vector) {
    this.teleportTo(functions.foldPoints(this.point, vector));
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


export class Background extends GameObjectPart {}


export class Zone extends GameObject {
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
      activeDistance = functions.getDistanceFrom(point, points[i]);
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


export class GameZone extends Zone {
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


export class Snake extends GameObject {
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
    if (tail == undefined) tail = new this.tailClassDefault(this.head.point);

    tail.master = this;
    tail.teleportTo(this.parts[this.parts.length - 1].previousPoint);
    this.parts.push(tail);
  }

  cutOff(number) {
    for (let i = 0; i < number; i++) {
      this.parts.pop();
    }
  }

  stateProcess() {
    this.moveParts();
  }

  moveParts() {
    if (this.head.direction.join() == this.head.direction.map(number => 0).join()) return;

    for (let tact = 0; tact < this.step; tact++) {
      this.head.move(this.head.direction);

      for (let i = 1; i < this.parts.length; i++) {
        this.parts[i].move(functions.getVectorFrom(this.parts[i].point, this.parts[i - 1].previousPoint));
      }
    }
  }

  get tails() {
    let tails = Array.from(this.parts);
    tails.splice(tails.indexOf(this.head), 1);

    return tails;
  }
}


export class SnakeHead extends GameObjectPart {
  static get defaultAvatar() {
    return Avatar.createTestAvatar([252, 216, 78]);
  }

  reactionToCellmate(cellmate) {
    if (cellmate instanceof Fugitive) {
      cellmate.runAway();
      this.master.addTail();
    }

    if (functions.inPresence(cellmate, this.master.parts)) {
      this.master.cutOff(this.master.parts.length - this.master.parts.indexOf(cellmate));
    }
  }
}


export class SnakeTail extends GameObjectPart {
  static get defaultAvatar() {
    return Avatar.createTestAvatar([255, 224, 107]);
  }
}


export class Fugitive extends GameObjectPart {
  constructor(point, escapePoints, master, color) {
    super(point, master, color);
    this.escapePoints = escapePoints;
  }

  runAway() {
    let newPoint = this.escapePoints[functions.getRandomInt(0, this.escapePoints.length - 1)];

    if (this.point.join() == newPoint.join())
      this.runAway();
    else
      this.teleportTo(newPoint);
  }
}


export class Eggplant extends Fugitive {
  static get defaultAvatar() {
    return Avatar.createTestAvatar([179, 39, 230]);
  }
}
