import State from "../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import GooseController, { GooseStates } from "./GooseController";

export default abstract class GooseState extends State {
    /** The goose sprite */
	protected owner: AnimatedSprite;
	protected gravity: number;
	protected parent: GooseController;

	public constructor(parent: GooseController, owner: AnimatedSprite) {
		super(parent);
        this.gravity = 500;
		this.owner = owner;
	}

	/**
	 * Here is where the states are defined for handling balloon gravity effects. We recieve a player suit change event 
	 * and adjust the balloon gravity effects accordingly based on its color
	 */
	public handleInput(event: GameEvent): void {
		switch (event.type) {
            case "goose_hit_start": {
                this.finished(GooseStates.DEAD);
                break;
            }
            case "goose_hit_end": {
                console.log("Got goose hit end!");
                break;
            }
        }
	}

	public update(deltaT: number): void {
		// Do gravity
		this.parent.velocity.y += this.gravity * deltaT;

		if (this.owner.onWall) {
			// Flip around
			this.parent.direction.x *= -1;
			this.owner.invertX = !this.owner.invertX;
		}

		if (this.owner.onCeiling || this.owner.onGround) {
			if (this.gravity != 0) {
				this.parent.velocity.y =
					(Math.sign(-this.parent.velocity.y) * this.parent.ySpeed);
			}
			else{
				this.parent.velocity.y =
					(Math.sign(-this.parent.velocity.y) * MathUtils.clamp(Math.abs(this.parent.velocity.y), 0, this.parent.ySpeed));
			}
		}
	}
}
