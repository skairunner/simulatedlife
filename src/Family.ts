// Describe a group of agents that work together.
export default class Family {
  public members: number[]; // array of uids of members
  public votes: string[]; // current votes for action
  public uid: number;

  constructor(uid: number) {
    this.members = [];
    this.votes = [];
    this.uid = uid;
  }
}