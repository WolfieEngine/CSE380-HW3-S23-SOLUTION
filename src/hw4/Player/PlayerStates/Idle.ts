import Input from "../../../Wolfie2D/Input/Input";
import { PlayerStates } from "../PlayerController";
import { HW4PlayerSpritesheet } from "../../HW4Resources";
import OnGround from "./OnGround";

export default class Idle extends OnGround {

	onEnter(options: Record<string, any>): void {
        this.owner.animation.play(HW4PlayerSpritesheet.IDLE);
		this.parent.speed = this.parent.MIN_SPEED;
	}

	update(deltaT: number): void {
		super.update(deltaT);

		let dir = this.parent.inputDir;

		if(!dir.isZero() && dir.y === 0){
			
			this.finished(PlayerStates.WALK);
			
		}
		
		this.parent.velocity.x = 0;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}