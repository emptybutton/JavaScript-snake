import {TimeLoop} from "./time-managers.js";
import {createMethodAsFunction} from "./functions.js";


class HtmlManager {
  static visibilityZone = [];
  #body;

  constructor(body) {
    this.constructor.visibilityZone.push(this);

    this.#body = body;
    this.resetBodyState();
  }

  resetBodyState() {}

  get body() {
    return this.#body;
  }
}


class Hider extends HtmlManager {
  static timeDifferenceOfShowingStages = 0;
  static timeDifferenceOfHidingStages = 0;

  constructor(body) {
    super(body);
    this.timeEvent;

    this.initializeTimeEvents();
  }

  initializeTimeEvents() {
    this.stopСhanging();
    this.timeEvent = new TimeLoop();
  }

  isChanging() {
    if (this.timeEvent)
      return this.timeEvent.isActive();
    else
      return false;
  }

  isShown() {}

  showUp() {}

  hide() {}

  startShowing() {
    this.stopСhanging();

    this.timeEvent.action = createMethodAsFunction(this, this.activateStageOfShowing);
    this.timeEvent.tact = this.constructor.timeDifferenceOfShowingStages;

    this.timeEvent.start();
  }

  startHiding() {
    this.stopСhanging();

    this.timeEvent.action = createMethodAsFunction(this, this.activateStageOfHiding);
    this.timeEvent.tact = this.constructor.timeDifferenceOfHidingStages;

    this.timeEvent.start();
  }

  activateStageOfShowing() {
    this.stopСhanging();
    this.showUp();
  }

  activateStageOfHiding() {
    this.stopСhanging();
    this.hide();
  }

  stopСhanging() {
    if (this.isChanging()) {
      this.timeEvent.stop();
    }
  }
}


class Follower extends Hider {
  #master;

  constructor(body, master) {
    super(body);
    this.#master = master;
    this.resetFollowerState();
  }

  resetFollowerState() {}

  get master() {
    return this.#master;
  }
}


export class Hint extends Follower {
  static timeDifferenceOfShowingStages = 25;

  constructor(body, master, transparencyLimit=1, transparencyFactor=1) {
    super(body, master);

    this.transparencyFactor = transparencyFactor;
    this.transparencyLimit = transparencyLimit;
  }

  resetBodyState() {
    this.stopСhanging();
    this.hide();
  }

  resetFollowerState(futureMaster) {
    this.master.onmouseover = () => {
      this.startShowing();
    }

    this.master.onmouseout = () => {
      this.startHiding();
    }
  }

  isShown() {
    return this.transparencyLimit == parseFloat(this.body.style.opacity);
  }

  activateStageOfShowing() {
    let opacity = parseFloat(this.body.style.opacity);

    if (opacity)
      opacity += this.currentTransparencyProgression;
    else
      opacity = this.currentTransparencyProgression;

    if (opacity > this.transparencyLimit) {
      this.stopСhanging();
      this.showUp();
    }
    else {
      this.body.style.opacity = opacity;
    }
  }

  activateStageOfHiding() {
    let opacity = parseFloat(this.body.style.opacity);

    if (opacity)
      opacity -= this.currentTransparencyProgression;
    else
      opacity = this.currentTransparencyProgression;

    if (opacity <= 0) {
      this.stopСhanging();
      this.hide();
    }
    else {
      this.body.style.opacity = opacity;
    }
  }

  showUp() {
    this.body.style.opacity = this.transparencyLimit;
  }

  hide() {
    this.body.style.opacity = 0;
  }

  get currentTransparencyProgression() {
    return 0.1 * this.transparencyFactor;
  }
}

export function getChildElementByAtribute(element, classOfsearthAtribute, searthAtribute) {
  let elementsForSearching = Array.from(element.children);
  let newElements = [];

  while (true) {
    elementsForSearching = elementsForSearching.concat(...newElements);

    for (let i = 0; i < elementsForSearching.length; i++) {
      if (elementsForSearching[i][classOfsearthAtribute] == searthAtribute)
        return elementsForSearching[i];

      else
        newElements = newElements.concat(...elementsForSearching[i].children);
    }
  }
}
