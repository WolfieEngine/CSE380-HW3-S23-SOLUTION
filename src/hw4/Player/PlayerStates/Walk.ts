import Input from "../../../Wolfie2D/Input/Input";
import { PlayerStates } from "../PlayerController";
import OnGround from "./OnGround";

export default class Walk extends OnGround {

	onEnter(options: Record<string, any>): void {
		this.parent.speed = this.parent.MIN_SPEED;
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