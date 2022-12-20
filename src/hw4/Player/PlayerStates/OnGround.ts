import Input from "../../../Wolfie2D/Input/Input";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { HW4Controls } from "../../HW4Controls";
import { PlayerTweens } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class OnGround extends PlayerState {
	onEnter(options: Record<string, any>): void {}

	update(deltaT: number): void {
		if(this.parent.velocity.y > 0){
			this.parent.velocity.y = 0;
		}
		super.update(deltaT);

		let direction = this.parent.inputDir;

		if(direction.x !== 0){
			this.owner.invertX = MathUtils.sign(direction.x) < 0;
		}

		// If we jump, move to the Jump state, give a burst of upwards velocity, and play our flip tween animation if 
		// we're moving left or right
		if(Input.isJustPressed(HW4Controls.JUMP)){
			this.finished(HW4Controls.JUMP);
			this.parent.velocity.y = -500;
			if(this.parent.velocity.x !== 0){
				this.owner.tweens.play(PlayerTweens.FLIP);
			}
		} else if(!this.owner.onGround){
			this.finished(HW4Controls.JUMP);
		}
	}

	onExit(): Record<string, any> {
		return {};
	}
}