import Vec2 from 'vec2';
import { mapGetOrDie } from './Utility';

interface IHasPos {
  pos: Vec2;
}

interface IFamilyMessage {
  msgtype: FamilyMsgType;
  pos: Vec2;
}

export enum FamilyMsgType {
  None,
  FoodFound,
  FoodGone,
  Member
}

// Describe a group of agents that work together.
export class Family {
  public members: number[]; // array of uids of members
  public votes: string[]; // current votes for action
  public uid: number;
  public com: Vec2; // center of mass for family
  public sentmsgs: IFamilyMessage[]; // communications.
  public recvmsgs: IFamilyMessage[]; // communications.

  constructor(uid: number) {
    this.members = [];
    this.votes = [];
    this.uid = uid;
    this.sentmsgs = [];
    this.recvmsgs = [];
    this.com = new Vec2();
  }

  public send(msg: IFamilyMessage) {
    this.sentmsgs.push(msg);
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