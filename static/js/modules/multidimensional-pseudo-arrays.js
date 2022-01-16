export class Space {
  #cells = [];
  #size = [];

  constructor(size, cellClass=Cell) {
    this.allocateSpace(size, cellClass);
  }

  allocateSpace(size, cellClass=Cell) {
    this.#size = size;
    const points = this.#createMultidimensionalPoints(size);

    for (let i = 0; i < points.length; i++) {
      this.#cells.push(new cellClass(points[i]));
    }
  }

  getFrom(point) {
    return this.#getCellByPoint(point).data;
  }

  getAll() {
    return Array.from(this.#cells, cell => cell.data);
  }

  index(data) {
    for (let i = 0; i < this.#cells.length; i++) {
      if (this.#cells[i].data == data)
        return this.#cells[i].address;
    }
  }

  setTo(point, data) {
    this.#getCellByPoint(point).data = data;
  }

  map(fun) {
    let newData = Array.from(this.getAll(), fun);

    for (let i = 0; i < this.#cells.length; i++) {
      this.#cells[i].data = newData[i];
    }
  }

  get size() {
    return this.#size;
  }

  #getCellByPoint(point) {
    for (let i = 0; i < this.#cells.length; i++) {
      if (this.#cells[i].address.join() == point.join())
        return this.#cells[i];
    }

    throw `cell ${point} not found`;
  }

  #createMultidimensionalPoints(size) {
    let points = this.#createPseudoOneDimensionalPoints(size[0], size.length);
    let activePoint;
    let numberOfcreatedPoints;

    for (let axis = 1; axis < size.length; axis++) {
      numberOfcreatedPoints = points.length;
      for (let layer = 1; layer < size[axis]; layer++) {
        for (let pointIndex = 0; pointIndex < numberOfcreatedPoints; pointIndex++) {
          activePoint = Array.from(points[pointIndex]);
          activePoint[axis] = layer;
          points.push(activePoint);
        }
      }
    }

    return points;
  }

  #createPseudoOneDimensionalPoints(numberOfPoints, numberOfAxles=1, activeAxis=0) {
      let points = [];
      let activePoint;

      for (let coordinate = 0; coordinate < numberOfPoints; coordinate++) {
          activePoint = this.#createEmptyPoint(numberOfAxles);
          activePoint[activeAxis] = coordinate;
          points.push(activePoint);
      }

      return points;
  }

  #createEmptyPoint(size) {
    let point = [];
    for (let i = 0; i < size; i++) {point[i] = 0;}
    return point;
  }
}


class Cell {
  constructor(address, data) {
    this.address = address;
    this.data = data;
  }
}
