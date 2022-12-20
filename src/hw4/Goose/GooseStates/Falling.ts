import GooseState from "./GooseState";

export default class Sinking extends GooseState {
	
	onEnter(): void {
        this.gravity = this.parent.gravity;
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