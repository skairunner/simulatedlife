export enum VOTE {
  Eat = 1,
  Rest,
  Search
}

export interface IVote {
  type: VOTE;
}