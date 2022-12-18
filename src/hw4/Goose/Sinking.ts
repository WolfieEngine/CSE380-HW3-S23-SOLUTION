import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BalloonState from "./GooseState";

export default class Sinking extends BalloonState {
	
	onEnter(): void {
        this.gravity = this.parent.gravity;
		// this.owner.animation.play("IDLE", true);
	}

	update(deltaT: number): void {
		super.update(deltaT);

        this.parent.velocity.x = this.parent.direction.x * this.parent.speed;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}