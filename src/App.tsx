import * as Random from "random-js";
import Checkbox from 'rc-checkbox';
import * as React from 'react';
import Vec2 from 'vec2';

import { Agent, CalculateAgent, IAgentProps } from './Agent';
import { HAS_COLOR, HEIGHT, IS_DEBUG, ToggleColors, ToggleDebug, WIDTH } from './constants';
import DatedCoord from './DatedCoord';
import { Family } from './Family';
import { Food, IFoodProps, UncertainLocationDict } from './Food';
import { randomVec2, rng } from './Utility';

import './App.css';

const FOODMARGIN = 20;
function makeNewFood(key: number): IFoodProps {
  const num = Random.integer(50, 100)(rng);
  return {
    key,
    maxnum: num,
    num,
    pos: randomVec2(FOODMARGIN, WIDTH - FOODMARGIN, FOODMARGIN, HEIGHT - FOODMARGIN, rng),
    rad: Random.real(Math.sqrt(num), Math.sqrt(num)*2)(rng)
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
  private framerate = 25;

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
        acel: new Vec2(),
        fam: state.families[famnum],
        food: 30,
        foodsources: new UncertainLocationDict<DatedCoord>(),
        goal: new Vec2(),
        goalstack: [],
        heading: 0,
        key: i,
        pos: new Vec2(x, y),
        selfish: Random.real(.3, 1)(rng),
        uid: state.uidcount,
        vel: new Vec2()
      };
      state.agents.push(agent);
      state.agentdict.set(state.uidcount, agent);
      state.uidcount++;
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
      for (const family of newstate.families) {
        family.calccom(newstate.agentdict);
        family.recvmsgs = family.sentmsgs;
        family.sentmsgs = [];
      }

      for (const agent of newstate.agents) {
        CalculateAgent(agent, newstate.agents, newstate.foods, newstate.tick, this.framerate);
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
        <svg width="800" height="600" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {this.state.foods.map((val) => <Food {...val} key = {val.key} />)}
          {this.state.agents.map((val) => <Agent {...val} key={val.key} />)}
        </svg>
        <div><Checkbox checked={IS_DEBUG ? 1 : 0} onChange={ToggleDebug}/> <span>Debug</span></div>
        <div><Checkbox checked={HAS_COLOR ? 0 : 1} onChange={ToggleColors}/> <span>Decolor</span></div>
      </div>
    );
  }
}

export default App;
