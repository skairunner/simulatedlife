export const WIDTH = 400;
export const HEIGHT = 300;
export const EPSILON = 0.001; // minimum distance for repulsion
export const REPULSION = 4; // constant
export const DETECTION_RADIUS = 40;
export const SLOWING_RADIUS = 20;

export let IS_DEBUG = false;
export function ToggleDebug() {
  IS_DEBUG = !IS_DEBUG;
  return IS_DEBUG;
}

export let HAS_COLOR = true;
export function ToggleColors() {
  HAS_COLOR = !HAS_COLOR;
  return HAS_COLOR;
}