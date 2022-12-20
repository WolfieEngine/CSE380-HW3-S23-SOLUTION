import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { PlayerStates } from "../PlayerController";
import InAir from "./InAir";

import { HW4Sounds } from "../../HW4Resources";

export default class Jump extends InAir {

	onEnter(options: Record<string, any>): void {
        // I don't like this but it should get the job done - PeteyLumpkins
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: HW4Sounds.JUMP_AUDIO_KEY, loop: false, holdReference: false});
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