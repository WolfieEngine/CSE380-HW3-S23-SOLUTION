import { PlayerStates } from "../PlayerController";
import { HW4PlayerSpritesheet } from "../../HW4Resources";
import OnGround from "./OnGround";

export default class Walk extends OnGround {

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MIN_SPEED;
        this.owner.animation.playIfNotAlready(HW4PlayerSpritesheet.WALK);
	}

	update(deltaT: number): void {
		super.update(deltaT);

        // Get the input direction from the player controller
		let dir = this.parent.inputDir;
        // If the player is not moving - transition to the Idle state
		if(dir.isZero()){
			this.finished(PlayerStates.IDLE);
		} 

		this.parent.velocity.x = dir.x * this.parent.speed
		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}