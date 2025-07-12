//maps the value x from the range [a1,a2] to [b1,b2] (can exceed bounds)
export function map_num(
  x: number,
  a1: number,
  a2: number,
  b1: number,
  b2: number
): number {
  return (x - a1) * ((b2 - b1) / (a2 - a1)) + b1;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(Math.min(val, max), min);
}

export function map_clamp(
  x: number,
  a1: number,
  a2: number,
  b1: number,
  b2: number
): number {
  if (b1 == b2) {
    return b1;
  } else if (b2 > b1) {
    return clamp(map_num(x, a1, a2, b1, b2), b1, b2);
  } else {
    return clamp(map_num(x, a1, a2, b1, b2), b2, b1);
  }
}

//Adapted from Rosettacode
export function knuthShuffle(arr: any[]) {
  var rand: number, temp: number, i: number;

  for (i = arr.length - 1; i > 0; i -= 1) {
    rand = Math.floor((i + 1) * Math.random()); //get random between zero and i (inclusive)
    temp = arr[rand];
    arr[rand] = arr[i]; //swap i (last element) with random element.
    arr[i] = temp;
  }
  return arr;
}
