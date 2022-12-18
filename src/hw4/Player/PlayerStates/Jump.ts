import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

export default class Jump extends InAir {

	onEnter(options: Record<string, any>): void {
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "jump", loop: false, holdReference: false});
	}

	update(deltaT: number): void {
		super.update(deltaT);

		if(this.owner.onCeiling){
			this.parent.velocity.y = 0;
		}

		// If we're falling, go to the fall state
		if(this.parent.velocity.y >= 0){
			this.finished(PlayerStates.FALL);
		}
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}