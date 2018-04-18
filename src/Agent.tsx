import {interpolateLab} from 'd3-interpolate';
import {schemeCategory10} from 'd3-scale-chromatic';
import * as React from 'react';
import Vec2 from 'vec2';
import Family from './Family';

import "./Agent.css";

export interface IAgentProps {
    fam: Family;
    food: number;
    goal: Vec2;
    heading: number;
    key: number;
    pos: Vec2;
    uid: number;
    vel: Vec2;
}

export function Agent (props: IAgentProps) {
  return (
  <g className="Agent">
      <circle key={props.key}
              fill={interpolateLab("#000", "#FFF")(props.food > 100 ? 1 : props.food / 100)}
              cx={props.pos.x}
              cy={props.pos.y}
              r="5"
              stroke={schemeCategory10[props.fam.uid % 10]}
              strokeWidth="2"/>
      <text>{}</text>
  </g>)
}