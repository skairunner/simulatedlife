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
return <circle
    className="Food"
    cx={props.pos.x}
    cy={props.pos.y}
    opacity={props.num / props.maxnum}
    r={props.rad}
    />
}