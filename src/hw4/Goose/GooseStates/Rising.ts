import GooseState from "./GooseState";

export default class Rising extends GooseState {
	
	onEnter(): void {
        this.gravity = -this.parent.gravity;

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