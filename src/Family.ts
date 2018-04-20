import Vec2 from 'vec2';
import { mapGetOrDie } from './Utility';

interface IHasPos {
  pos: Vec2;
}

// Describe a group of agents that work together.
export default class Family {
  public members: number[]; // array of uids of members
  public votes: string[]; // current votes for action
  public uid: number;
  public com: Vec2; // center of mass for family

  constructor(uid: number) {
    this.members = [];
    this.votes = [];
    this.uid = uid;
    this.com = new Vec2();
  }

  public calccom(lookup: Map<number, IHasPos>) {
    this.com.zero();
    for (const agentid of this.members) {
      this.com.add(mapGetOrDie(agentid, lookup).pos);
    }
    this.com.divide(this.members.length);
  }

  public in(uid: number) {
    return this.members.indexOf(uid) !== -1;
  }
}