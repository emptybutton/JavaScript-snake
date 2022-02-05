export function convertToCssRGBA(array) {
  return `rgba(${array.slice(0, 4)})`;
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getSquareForm(sideLength) { // test
  let points = [];
  for (let y = 0; y < sideLength; y++) {
    for (let x = 0; x < sideLength; x++) {
      points.push([x, y]);
    }
  }

  return points;
}

export function getDistanceFrom(firstPoint, secondPoint) {
  return Math.sqrt(getVectorFrom(firstPoint, secondPoint).map(coordinate => coordinate**2).reduce((sum, elem) => sum + elem, 0));
}

export function getVectorFrom(startPoint, endPoint) {
  let vector = [];
  for (let i = 0; i < startPoint.length; i++) {
    vector.push(endPoint[i] - startPoint[i]);
  }

  return vector;
}

export function foldPoints(...points) {
  let finalPoint = points[0];

  for (let i = 1; i < points.length; i++) {
    if (finalPoint.length < points[i].length)
      for (let axis = finalPoint.length; axis < points[i].length; axis++) {
        finalPoint.length++;
        finalPoint[axis] = 0;
      }

    for (let axis = 0; axis < points[i].length; axis++) {
      finalPoint[axis] += points[i][axis];
    }
  }

  return finalPoint;
}
