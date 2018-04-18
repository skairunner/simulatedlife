import * as Random from "random-js";
import * as React from 'react';
import Vec2 from 'vec2';
import {Agent, IAgentProps} from './Agent';
import Family from './Family';
import {Food, IFoodProps} from './Food';
import {arrmin} from './Utility';

import './App.css';

const WIDTH = 800;
const HEIGHT = 600;
const EPSILON = 0.1; // minimum distance for repulsion
const REPULSION = 4; // constant

const rng = Random.engines.mt19937();
rng.autoSeed();

function randomVec2(xmin: number, xmax: number, ymin: number, ymax: number, rnginst: Random.MT19937) {
  return new Vec2(Random.real(xmin, xmax)(rng), Random.real(ymin, ymax)(rnginst));
}

function makeNewFood(key: number): IFoodProps {
  const num = Random.integer(50, 500)(rng);
  return {
    key,
    maxnum: num,
    num,
    pos: randomVec2(0, WIDTH, 0, HEIGHT, rng),
    rad: Random.real(Math.sqrt(num)/2, Math.sqrt(num))(rng)
  }
}

interface IAppState {
  agents: IAgentProps[];
  families: Family[];
  foods: IFoodProps[];
  tick: number;
  agentdict: Map<number, IAgentProps>;
  uidcount: number;
}

// const TAU = Math.PI * 2;

class App extends React.Component<object, IAppState> {
  private framerate = 40;

  constructor(props: object) {
    super(props);
    const state: IAppState = {
      agentdict: new Map(),
      agents: [],
      families: [],
      foods: [],
      tick: 0,
      uidcount: 0
    };


    for (let i = 0; i < 10; i++) {
      const x = 100 + 50 * (i % 3) + Random.integer(0, 50)(rng);
      const y = 100 + 50 * Math.floor(i / 3) + Random.integer(0, 50)(rng);
      // Pick a family.
      const famnum = Random.integer(0, state.families.length)(rng);
      if (famnum === state.families.length) {
        // make new family
        state.families.push(new Family(famnum));
      }
      state.families[famnum].members.push(i);

      const agent = {
        fam: state.families[famnum],
        goal: new Vec2(),
        heading: 0,
        key: i,
        pos: new Vec2(x, y),
        uid: state.uidcount,
        vel: new Vec2()
      };
      state.agents.push(agent);
      state.agentdict.set(state.uidcount, agent);
    }

    for (let i = 0; i < 10; i++) {
      state.foods.push(makeNewFood(i));
    }
    this.state = state;

    const interval = 1000/this.framerate;
    setInterval(()=>this.tick(interval/1000), interval);
  }

  public tick(dt: number) {
    this.setState((oldstate) => {
      const newstate = {...oldstate};
      newstate.tick += 1;
      for (const agent of newstate.agents) {
        // if within range of food, eat it.
        let goalset = false;
        for (const food of newstate.foods) {
          if (food.pos.distance(agent.pos) <= food.rad) {
            // within distance!
            food.num -= 1;
            agent.goal = agent.pos;
            goalset = true;
          }
        }
        // Otherwise, locate a food.
        if (!goalset) {
          const distances = [];
          for (const food of newstate.foods) {
            if (food.num > 0) {
              distances.push({food, d: food.pos.distance(agent.pos)});
            }
          }
          if (distances.length !== 0) {
            goalset = true;
            const min = arrmin(distances, d => d.d);
            agent.goal = min.food.pos;
          }
        }
        if (!goalset) {
          // goal was not set, idle.
          agent.goal = agent.pos;
        }

        // Try not to overlap
        const stayAway = new Vec2();
        for (const agent2 of newstate.agents) {
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
        const toGoal = agent.goal.subtract(agent.pos, true);
        agent.vel.multiply(.99); // friction
        toGoal.multiply(dt);
        agent.vel.add(toGoal);
        agent.vel.add(stayAway);
        const len = agent.vel.lengthSquared();
        if (len > 500) {
          agent.vel.multiply(500 / len);
        }
        agent.pos.add(agent.vel.multiply(dt, true));
        const angle = agent.vel.angleTo(new Vec2(0, 1));
        agent.heading = angle;
      }

      for (let i = newstate.foods.length - 1; 0 <= i; i--) {
        const food = newstate.foods[i];
        // replace foods if num is 0
        if (food.num < 0) {
          newstate.foods[i] = makeNewFood(food.key);
        }
      }
      return newstate;
    })
  }


  public render() {
    return (
      <div className="App">
        <svg height={HEIGHT} width={WIDTH}>
          {this.state.foods.map((val) => <Food {...val} key = {val.key} />)}
          {this.state.agents.map((val) => <Agent {...val} key={val.key} />)}
        </svg>
      </div>
    );
  }
}

export default App;
