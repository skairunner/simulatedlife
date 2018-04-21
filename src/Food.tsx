import * as React from 'react';
import Vec2 from 'vec2';

import "./Agent.css";

interface ICoordinatey {
  x: number;
  y: number;
}

// Rounds positions to .1 to compare knowledge
export class UncertainLocationDict<T> {
  public static makeKey(key: ICoordinatey) {
    const x = key.x.toFixed(1);
    const y = key.y.toFixed(1);
    return `${x}|${y}`;
  }

  public dict: Map<string, T>;

  constructor() {
    this.dict = new Map<string, T>();
  }
  
  public has(key: ICoordinatey) {
    return this.dict.has(UncertainLocationDict.makeKey(key));
  }

  public set(key: ICoordinatey, val: T) {
    this.dict.set(UncertainLocationDict.makeKey(key), val);
  }

  public get(key: ICoordinatey) {
    this.dict.get(UncertainLocationDict.makeKey(key));
  }

  public delete(key: ICoordinatey) {
    const realkey = UncertainLocationDict.makeKey(key);
    return this.dict.delete(realkey);
  }

  get size() {
    return this.dict.size;
  }

  public values() {
    return this.dict.values();
  }
}

export interface IFoodProps {
    pos: Vec2;
    num: number;
    maxnum : number;
    key: number;
    rad: number;
  }
  
export function Food(props: IFoodProps) {
return (
  <g className="Food" transform={`translate(${props.pos.x}, ${props.pos.y})`}>
    <circle
      className="innerfood"
      opacity={Math.sqrt(props.num / props.maxnum)}
      r={Math.sqrt(props.num)}/>
    <circle
      className="outerfood"
      opacity={props.num / props.maxnum}
      r={props.rad}/>
  </g>)
}