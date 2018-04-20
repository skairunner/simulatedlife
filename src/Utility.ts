import * as Random from 'random-js';
import Vec2 from 'vec2';
// tslint:disable prefer-const

export const rng = Random.engines.mt19937();
rng.autoSeed();

export function randomVec2(xmin: number, xmax: number, ymin: number, ymax: number, rnginst: Random.MT19937) {
  return new Vec2(Random.real(xmin, xmax)(rng), Random.real(ymin, ymax)(rnginst));
}

type keyfunctype<T> = (d: T) => number | object | string; // accepts a type T and outputs a Comparable C

export function mapGetOrDie<K, V>(key: K, map: Map<K, V>): V {
  let o = map.get(key);
  if (o) {
    return o;
  }
  throw new Error(`Key ${key} does not exist in map.`);
}

export function arrmin<T>(arr: T[], keyfunc?: keyfunctype<T>) {
	if (keyfunc === undefined) {
		keyfunc = d => d;
	}
	return arr.reduce((a, b)=>{
		// return the smaller object
		return keyfunc!(a) > keyfunc!(b) ? b : a;
	})
}

export function arrmax<T>(arr: T[], keyfunc?: keyfunctype<T>) {
	if (keyfunc === undefined) {
		keyfunc = d => d;
	}
	return arr.reduce((a, b)=>{
		// return the smaller object
		return keyfunc!(a) > keyfunc!(b) ? a : b;
	})
}

/* tslint:disable:curly */
export function arrsort<T>(arr: T[], reverse?: boolean, keyfunc?: keyfunctype<T>) {
  if (keyfunc === undefined) {
    keyfunc = d => d;
  }
  if (reverse) {
    return arr.sort((a, b) => {
      let a2 = keyfunc!(a);
      let b2 = keyfunc!(b);
      if (a2 > b2) return -1;
      if (a2 < b2) return 1;
      return 0;
    });
  }
  return arr.sort((a, b) => {
    let a2 = keyfunc!(a);
    let b2 = keyfunc!(b);
    if (a2 > b2) return 1;
    if (a2 < b2) return -1;
    return 0;
  });
}

export function isarray<T>(a: T) {
  return a instanceof Array;
}