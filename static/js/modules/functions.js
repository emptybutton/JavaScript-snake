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
