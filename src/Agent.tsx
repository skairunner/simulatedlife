import {interpolateLab} from 'd3-interpolate';
import {schemeCategory10} from 'd3-scale-chromatic';
import * as React from 'react';
import Vec2 from 'vec2';
import isNumber from './is-number';

import {DETECTION_RADIUS, EPSILON, HEIGHT, REPULSION, WIDTH} from './constants';
import Family from './Family';
import {IFoodProps} from './Food';
import {arrmax, randomVec2, rng} from './Utility';

import "./Agent.css";

export class DatedCoord {
  public pos: Vec2;
  public t: number; // time of observation in ticks.
  constructor(pos: Vec2, t: number) {
    this.pos = pos;
    this.t = t;
  }
}

interface IGoalState {
  g: Goals;
  p: number; // utility score
  info: IGoalStatePayload; // info about the payload
}

interface IGoalStatePayload {
  target?: string | DatedCoord;
  outvector?: Vec2;
  radius?: number;
}

export interface IAgentProps {
  // cautious: number; // Determines up to how long ago of datedcoords will trust.
  fam: Family;
  food: number;
  foodsources: DatedCoord[];
  goal: Vec2;
  goalstack: IGoalState[]; 
  heading: number;
  key: number;
  pos: Vec2;
  uid: number;
  vel: Vec2;
}

export enum Goals {
  None,
  DiscoverFood,
  Goto,
  EatFood,
  VerifyFood,
  LocateKin,
  Broadcast,
  Play
}

export function ExpandGoals(prev: IGoalState, agent: IAgentProps): IGoalState[] {
  let goalstack: IGoalState[] = [];
  switch (prev.g) {
    case Goals.EatFood:
      goalstack.push({g: Goals.Goto, info: {target: "AFood"}, p: 0});
      goalstack = goalstack.concat(ExpandGoals(goalstack[0], agent));
      break;
    case Goals.Goto:
      if (prev.info.target instanceof DatedCoord) {
        break;
      } else if (prev.info.target && prev.info.target === "AFood") {
        goalstack.push({g: Goals.DiscoverFood, info: {}, p: 0});
        break;
      } else {
        throw new Error(`Target ${prev.info.target} is not valid.`);
      }
    case Goals.VerifyFood:
      goalstack.push({g: Goals.Goto, info: {target: prev.info.target, radius: 5}, p: 0});
      goalstack = goalstack.concat(ExpandGoals(goalstack[0], agent));
      break;
    default:
      break;
  }
  return goalstack;
}

export function IsFoodKnowledgeGood(agent: IAgentProps, tick: number): DatedCoord | undefined {
  if (agent.foodsources.length === 0) {
    return;
  }
  // Find most recent
  const coord = arrmax(agent.foodsources, d => d.t);
  if (tick - coord.t < 1000) {
    return coord;
  }
  return;
}

interface IHasPos {
  pos: Vec2;
}

function removeByCoord(foodpos: DatedCoord, foods: IHasPos[]) {
  const foodindex = foods.findIndex(d => d.pos.equal(foodpos.pos));
  if (foodindex >= 0) {
    foods.splice(foodindex);
  }
}

export function CalculateAgent(agent: IAgentProps, agents: IAgentProps[], foods: IFoodProps[], tick: number, framerate: number) {
  const dt = 1/framerate;

  // Reduce food if it's a second
  if (tick % framerate === 0) {
    agent.food -= 4;
    if (agent.food < 0) {
      agent.food = 0;
    }
  }

  // If any foods are in sight, add to list of foods.
  for (const food of foods) {
    if (food.pos.distance(agent.pos) < DETECTION_RADIUS) {
      // check it is not already in the list
      if (agent.foodsources.findIndex(d => d.pos.equal(food.pos)) < 0) {
        agent.foodsources.push(new DatedCoord(food.pos, tick));
      }
    }
  }

  // Re-evaluate goals
  const utilities = new Map<Goals, number>();
  for (const goal in Goals) {
    if (isNumber(goal)) {
      const goalnum = Number(goal);
      switch (goalnum) {
        case Goals.None:
          utilities.set(goalnum, 10);
          break;
        case Goals.EatFood:
          const hunger = agent.food > 100 ? 0 : 100 - agent.food;
          utilities.set(goalnum, hunger);
          break;
        default:
          break;
      }
    }
  }
  // Find highest goal and compare with current.
  const maxgoal = arrmax(Array.from(utilities.entries()), (d) => d[1]);
  let swapGoal = false;
  if (agent.goalstack.length !== 0) {
    // The current utility is that of the base goal
    if (agent.goalstack[0].p + 50 < maxgoal[1]) {
      swapGoal = true;
    }
  } else {
    // just... make it the goal
    swapGoal = true;
  }
  if (swapGoal) {
    agent.goalstack = [{g: maxgoal[0], p:maxgoal[1], info:{}}];
    agent.goalstack = agent.goalstack.concat(ExpandGoals(agent.goalstack[0], agent));
  }

  const vector = new Vec2();
  // Process goals.
  const topgoal = agent.goalstack[agent.goalstack.length - 1];
  switch (topgoal.g) {
    case Goals.None:
      vector.add(agent.vel.rotate(Math.PI / 2, false, true).normalize().multiply(2));
      if (agent.food < 50) {
        agent.goalstack.pop();
      }
      break;
    case Goals.DiscoverFood:
      const result = IsFoodKnowledgeGood(agent, tick);
      if (result) {
        // if there is now a close enough food.
        const prev = agent.goalstack[agent.goalstack.length - 2];
        if (prev.g === Goals.Goto) {
          prev.info.target = result;
          const food = foods.find(d => d.pos.equal(result.pos));
          if (food) {
            prev.info.radius = food.rad;
          } else {
            // food doesn't exist somehow
            removeByCoord(result, agent.foodsources);
          }
        }
        if (agent.goalstack[0].g === Goals.EatFood) {
          agent.goalstack[0].info.target = result;
        }
        agent.goalstack.pop();
      } else {
        // Search pattern: pick a random direction and run with it.
        if (topgoal.info.outvector) {
          vector.add(topgoal.info.outvector);
        } else {
          topgoal.info.outvector = randomVec2(-1, 1, -1, 1, rng);
          topgoal.info.outvector.normalize().multiply(1000);
          vector.add(topgoal.info.outvector);
        }
      }
      break;
    case Goals.Goto:
      // Go to the coord target. If "AFood", check.
      if (topgoal.info.target) {
        if (topgoal.info.target instanceof DatedCoord) {
          // if close enough, pop.
          const epsilon = topgoal.info.radius ? topgoal.info.radius : 2;
          if (topgoal.info.target.pos.distance(agent.pos) < epsilon) {
            agent.goalstack.pop();
            break;
          }
          vector.add(topgoal.info.target.pos.subtract(agent.pos, true));
        } else if (topgoal.info.target === "AFood") {
          agent.goalstack = agent.goalstack.concat(ExpandGoals(topgoal, agent));
        } else {
          throw new Error("Illegal target for Goto: " + topgoal.info.target);
        }
      }
      break;
    case Goals.EatFood:
      // if full enough, pop
      if (agent.food > 100) {
        agent.goalstack.pop();
      }
      // if within range of food, eat it.
      if (topgoal.info.target) {
        if (topgoal.info.target instanceof DatedCoord) {
          const foodcoord = topgoal.info.target;
          // locate the food
          let thisfood: IFoodProps | undefined;
          for (const food of foods) {
            if (food.pos.distance(foodcoord.pos) < 0.1) {
              thisfood = food;
              break;
            }
          }
          // thisfood is right next to self.
          if (thisfood) {
            if (foodcoord.pos.distance(agent.pos) <= thisfood.rad) {
              // within distance!
              thisfood.num -= 1;
              agent.food += 1;
            } else {
              // Seek food again.
              const newgoal = {
                g: Goals.Goto,
                info: {target: foodcoord, radius: thisfood.rad},
                p: 0
              };
              agent.goalstack.push(newgoal);
              agent.goalstack = agent.goalstack.concat(ExpandGoals(newgoal, agent));
            }
          } else {
            // thisfood might not exist.
            // Try to goto food again.
            const newgoal = {
              g: Goals.VerifyFood,
              info: {target: foodcoord, radius: DETECTION_RADIUS * .9},
              p: 0
            };
            agent.goalstack.push(newgoal);
            agent.goalstack = agent.goalstack.concat(ExpandGoals(newgoal, agent));
          }
        } else {
          // Search for food.
          topgoal.info.target = "AFood";
          agent.goalstack = agent.goalstack.concat(ExpandGoals(topgoal, agent));
        }
      } else {
        topgoal.info.target = "AFood";
        agent.goalstack = agent.goalstack.concat(ExpandGoals(topgoal, agent));
      }
      break;
    case Goals.VerifyFood:
      // We should be in food range if we're here.
      if (topgoal.info.target) {
        const thisfood = foods.find(d => d.pos.equal((topgoal.info.target as DatedCoord).pos));
        if (thisfood) {
          agent.goalstack.pop();
        } else {
          // Delete from memory
          removeByCoord(topgoal.info.target as DatedCoord, agent.foodsources);
          agent.goalstack = [];
        }
      }
    }

  // Try not to overlap
  const stayAway = new Vec2();
  for (const agent2 of agents) {
    if (agent !== agent2) { // don't collide with self
      const awayvec = agent.pos.subtract(agent2.pos, true);
      const dist = awayvec.length();
      awayvec.divide(dist / REPULSION);
      if (dist < EPSILON) {
        awayvec.divide(EPSILON * EPSILON);
      } else {
        awayvec.divide(dist * dist);
      }
      stayAway.add(awayvec);
    }
  }

  // Next, seek the target.
  agent.vel.multiply(.99); // friction
  vector.multiply(dt);
  agent.vel.add(vector);
   agent.vel.add(stayAway);
  const len = agent.vel.lengthSquared();
  if (len > 500) {
    agent.vel.multiply(500 / len);
  }
  agent.pos.add(agent.vel.multiply(dt, true));
  const angle = agent.vel.angleTo(new Vec2(0, 1));
  agent.heading = angle;

  // Wraparound if required.
  if (agent.pos.x < 0) {
    agent.pos.x = WIDTH - 10;
  } else if (agent.pos.x > WIDTH) {
    agent.pos.x = 10;
  }
  if (agent.pos.y < 0) {
    agent.pos.y = HEIGHT - 10;
  } else if (agent.pos.y > HEIGHT) {
    agent.pos.y = 10;
  }
}

export function Agent (props: IAgentProps) {
  let heading;
  if (props.vel.lengthSquared() !== 0) {
    heading = props.vel.normalize(true).multiply(10);
  } else {
    heading = new Vec2(10,  0);
  }
  const linecolor = schemeCategory10[props.fam.uid % 10];
  let text = "";
  if (props.goalstack.length !== 0) {
    text = props.goalstack[props.goalstack.length - 1].g.toString();
  }
  return (
  <g className="Agent" transform={`translate(${props.pos.x}, ${props.pos.y})`}>
      <circle className="detection" cx="0" cy="0" r={DETECTION_RADIUS} />
      <line className="direction" x1="0" y1="0" x2={heading.x} y2={heading.y} stroke={linecolor}/>
      <circle className="agent" key={props.key}
        fill={interpolateLab("#000", "#FFF")(props.food > 100 ? 1 : props.food / 100)}
        cx="0"
        cy="0"
        r="5"
        stroke={linecolor}
        strokeWidth="2"/>
      <text y="4" fill={props.food > 75 ? "black" : "white"}>{text}</text>
  </g>)
}