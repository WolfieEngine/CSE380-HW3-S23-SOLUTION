import State from "../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { HW4Events } from "../../HW4Events";
import GooseController, { GooseStates } from "../GooseController";

/**
 * An abstract state for a goose StateMachineAI. 
 */
export default abstract class GooseState extends State {
    /** The goose sprite */
	protected owner: AnimatedSprite;
    /** The parent StateMachine of the goose */
	protected parent: GooseController;

    protected gravity: number;

	public constructor(parent: GooseController, owner: AnimatedSprite) {
		super(parent);
        this.gravity = 500;
		this.owner = owner;
	}

	/**
	 * Handles input events from the controller. 
	 */
	public handleInput(event: GameEvent): void {
		switch (event.type) {
            // Case: if the goose is hit by the player's weapon -> the goose is dead.
            case HW4Events.WEAPON_HIT_GOOSE: {
                this.handleWeaponHitGoose(event);
                break;
            }
            case HW4Events.GOOSE_HIT_PLAYER: {
                this.handleWeaponHitGoose(event);
                break;
            }
            // Default: throw an error - no unhandled events allowed!
            default: {
                throw new Error(`Unhandled event with type ${event.type} caught in GooseState`);
            }
        }
	}

	public update(deltaT: number): void {
		// Do gravity
		this.parent.velocity.y += this.gravity * deltaT;

        // If the goose hit a wall - turn the goose around
		if (this.owner.onWall) {
			// Flip direction
			this.parent.direction.x *= -1;
            // Flip direction the sprite is facing
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

    /**
     * Handles a collision event between a goose and the player's weapon
     * 
     * The collision events that get sent out from the Wolfie2D physics system contains
     * the ids of the two game nodes that collided. The data looks something like this:
     * 
     *     {
     *         node: number,
     *         other: number
     *     }
     * 
     * @param event the game event
     */
    public handleWeaponHitGoose(event: GameEvent) {

        // Get the ids of both nodes from the collision event
        let node: number = event.data.get("node");
        let other: number = event.data.get("other");

        // Make this goose dead if either node involved in the collision is the owner of this AI
        if (this.owner.id === node || this.owner.id === other) {
            this.finished(GooseStates.DEAD);
        }
    }
}
