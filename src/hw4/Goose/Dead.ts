import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GooseState from "./GooseState";

export default class GooseDead extends GooseState {

    public onEnter(options: Record<string, any>): void {
        // Make the goose invisible
        this.owner.visible = false;
        // Disable physics for the goose
        this.owner.disablePhysics();
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return; }

}