export function functionStructuring(func, ...funcArguments) {
  return () => func(...funcArguments);
}


export function activateEverybodyFrom(objectsVisibility) {
  for (let i = 0; i < objectsVisibility.length; i++) {
    objectsVisibility[i].event();
  }
}

export function convertToCssRGBA(array) {
  return `rgba(${array.slice(0, 4)})`;
}
