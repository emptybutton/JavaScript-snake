export function convertToCssRGBA(array) {
  return `rgba(${array.slice(0, 4)})`;
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
