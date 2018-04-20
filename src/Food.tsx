import * as React from 'react';
import Vec2 from 'vec2';

import "./Agent.css";

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