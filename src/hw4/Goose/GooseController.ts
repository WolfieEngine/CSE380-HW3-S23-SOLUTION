import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Sinking from "./Sinking";
import Rising from "./Rising";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Dead from "./Dead";

export enum GooseStates {
	SINKING = "sinking",
	RISING = "rising",
    DEAD = "dead"
}

export default class GooseController extends StateMachineAI {
	protected _owner: AnimatedSprite;
	protected _direction: Vec2;
	protected _velocity: Vec2;
	protected _speed: number;
	protected _ySpeed: number;
	protected _gravity: number;

	public initializeAI(owner: AnimatedSprite, options: Record<string, any>){
		this._owner = owner;
        this._owner.animation.play("idle_not_aggro");
        // this._owner.animation.play("IDLE");

		this.addState(GooseStates.SINKING, new Sinking(this, owner));
		this.addState(GooseStates.RISING, new Rising(this, owner));
        this.addState(GooseStates.DEAD, new Dead(this, owner));

		this._direction = new Vec2(-1, 0);
        this._velocity = Vec2.ZERO;
        this._speed = 100;
        this._ySpeed = 700;
        this._gravity = 1000;

		this.initialize(GooseStates.SINKING);
        this.receiver.subscribe("goose_hit_start");
	}

	changeState(stateName: string): void {
        super.changeState(stateName);
	}

	update(deltaT: number): void {
		super.update(deltaT);
	}

    public get velocity(): Vec2 { return this._velocity; }
    public get direction(): Vec2 { return this._direction; }
    public get ySpeed(): number { return this._ySpeed; }
    public get gravity(): number { return this._gravity; }
    public get speed(): number { return this._speed; }
}