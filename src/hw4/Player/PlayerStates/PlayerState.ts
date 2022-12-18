import State from "../../../Wolfie2D/DataTypes/State/State";
import StateMachine from "../../../Wolfie2D/DataTypes/State/StateMachine";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Input from "../../../Wolfie2D/Input/Input";
import GameNode from "../../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import { HW5_Events } from "../../hw5_enums";
import PlayerController from "../PlayerController";

/**
 * An abstract state for the player's state-machine ai.
 */
export default abstract class PlayerState extends State {

    protected parent: PlayerController;
	protected owner: AnimatedSprite;
	protected gravity: number;

	public constructor(parent: PlayerController, owner: AnimatedSprite){
		super(parent);
		this.owner = owner;
        this.gravity = 1000;
	}

    public abstract onEnter(options: Record<string, any>): void;

    /**
     * Handle game events from the parent.
     * @param event the game event
     */
	public handleInput(event: GameEvent): void {
        switch(event.type) {

            // Default - throw an error
            default: {
                throw new Error(`Unhandled event in PlayerState of type ${event.type}`);
            }
        }
	}

	public update(deltaT: number): void {
		// Do gravity 
		this.parent.velocity.y += this.gravity*deltaT;
	}

    public abstract onExit(): Record<string, any>;
}