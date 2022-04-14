export class Hint {
  #body;
  #target;
  #comingEvent;

  constructor(body, target, calculatePosition=(thisNewObject) => {}, transparencyLimit=0.90, transparencyFactor=3, comingStartDelay=400) {
    this.calculatePositionFunction = calculatePosition;

    this.body = body;
    this.target = target;

    this.transparencyFactor = transparencyFactor;
    this.transparencyLimit = transparencyLimit;

    this.comingStartDelay = comingStartDelay;
  }

  get isComing() {
    return new Boolean(this.#comingEvent);
  }

  get body() {
    return this.#body;
  }

  set body(newBody) {
    if (this.#body) {
      this.showUp();
    }

    this.#body = newBody;
    this.breakComing();
    this.hide();

    if (this.target) {
      this.calculatePositionFunction(this);
    }
  }

  get target() {
    return this.#target;
  }

  set target(newTarget) {
    if (this.#target) {
      this.breakComing();
      this.hide();

      this.#target.onmouseover = () => {}
      this.#target.onmouseout = () => {}
    }

    this.#target = newTarget;

    this.#target.onmouseover = () => {
      this.startComing();
    }

    this.#target.onmouseout = () => {
      this.breakComing();
      this.hide();
    }

    if (this.body) {
      this.calculatePositionFunction(this);
    }
  }

  startComing() {
    this.#comingEvent = setTimeout(
      () => {this.#comingEvent = setInterval(() => {this.activateStageOfComing()})},
      this.comingStartDelay
    )
  }

  activateStageOfComing() {
    let opacity = parseFloat(this.body.style.opacity);
    const unit = 0.01 * this.transparencyFactor;

    if (opacity)
      opacity += unit;
    else
      opacity = unit;

    if (opacity > this.transparencyLimit) {
      this.showUp();
      this.breakComing();
    }
    else {
      this.body.style.opacity = opacity;
    }
  }

  breakComing() {
    if (this.isComing) {
      clearInterval(this.#comingEvent);
      this.#comingEvent = undefined;
    }
  }

  showUp() {
    this.body.style.opacity = this.transparencyLimit;
  }

  hide() {
    this.body.style.opacity = 0;
  }
}
