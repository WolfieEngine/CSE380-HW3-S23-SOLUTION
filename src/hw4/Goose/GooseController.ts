import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Sinking from "./GooseStates/Falling";
import Rising from "./GooseStates/Rising";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Dead from "./GooseStates/Dead";
import { HW4Events } from "../HW4Events";

export enum GooseAnimations {

}

export enum GooseStates {
	SINKING = "sinking",
	RISING = "rising",
    DEAD = "dead"
}

export default class GooseController extends StateMachineAI {
    protected owner: AnimatedSprite;
	protected _direction: Vec2;
	protected _velocity: Vec2;
	protected _speed: number;
	protected _ySpeed: number;
	protected _gravity: number;

	public initializeAI(owner: AnimatedSprite, options: Record<string, any>){
		this.owner = owner;
        this.owner.animation.play("idle_not_aggro");
        // this._owner.animation.play("IDLE");

        // Set movement properties for the goose
        this._direction = new Vec2(-1, 0);
        this._velocity = Vec2.ZERO;
        this._speed = 100;
        this._ySpeed = 400;
        this._gravity = 1000;

        // Add states for the goose and set the initial state to "sinking"
		this.addState(GooseStates.SINKING, new Sinking(this, owner));
		this.addState(GooseStates.RISING, new Rising(this, owner));
        this.addState(GooseStates.DEAD, new Dead(this, owner));
        this.initialize(GooseStates.SINKING);

        // Subscribe to the weapon hit events
        this.receiver.subscribe(HW4Events.WEAPON_HIT_GOOSE);
        this.receiver.subscribe(HW4Events.GOOSE_HIT_PLAYER);
	}

	public update(deltaT: number): void {
		super.update(deltaT);
	}

    public get velocity(): Vec2 { return this._velocity; }
    public get direction(): Vec2 { return this._direction; }
    public get ySpeed(): number { return this._ySpeed; }
    public get gravity(): number { return this._gravity; }
    public get speed(): number { return this._speed; }
}