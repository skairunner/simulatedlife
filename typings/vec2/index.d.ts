declare module 'vec2' {
    interface IVec2Constructor {
        x: number;
        y: number;
    }

    class Vec2 {
        constructor();
        constructor(x: IVec2Constructor);
        constructor(x: number[]);
        constructor(x: number, y: number);
        add(x: IVec2Constructor, returnnew?: boolean): Vec2;
        add(x: number[], returnnew?: boolean): Vec2;
        add(x: number, y: number, returnnew?: boolean): Vec2;
        angleTo(vec: Vec2): number;
        distance(vec: Vec2): number;
        divide(x: number, returnnew?: boolean): Vec2;
        divide(x: number[], returnnew?: boolean): Vec2;
        divide(x: number, y: number, returnnew?: boolean): Vec2;
        divide(x: Vec2, returnnew?: boolean): Vec2;
        dot(vec: Vec2): number;
        equal(vec: Vec2): boolean;
        equal(x: number[]): boolean;
        equal(x: number, y:number): boolean;
        lengthSquared(): number;
        length(): number;
        multiply(x: number, returnnew?: boolean): Vec2;
        multiply(x: number[], returnnew?: boolean): Vec2;
        multiply(x: number, y: number, returnnew?: boolean): Vec2;
        multiply(x: Vec2, returnnew?: boolean): Vec2;
        normalize(returnnew?: boolean): Vec2;
        subtract(x: IVec2Constructor, returnnew?: boolean): Vec2;
        subtract(x: number[], returnnew?: boolean): Vec2;
        subtract(x: number, y: number, returnnew?: boolean): Vec2;
        zero(): Vec2;
        x: number;
        y: number;
    }
    
    export default Vec2;
}