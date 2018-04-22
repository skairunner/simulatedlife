import Vec2 from 'vec2';

export default class DatedCoord {
  public pos: Vec2;
  public t: number; // time of observation in ticks.
  constructor(pos: Vec2, t: number) {
    this.pos = pos;
    this.t = t;
  }
}