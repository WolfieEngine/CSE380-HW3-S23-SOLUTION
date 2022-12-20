import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { HW4Events } from "../../HW4Events";
import GooseState from "./GooseState";

export default class GooseDead extends GooseState {

    public onEnter(options: Record<string, any>): void {
        // Make the goose invisible
        this.owner.visible = false;

        // Disable physics for the goose
        this.owner.disablePhysics();

        // Send a signal to the scene indicating a goose died
        this.emitter.fireEvent(HW4Events.GOOSE_DIED);
    }

    // Ignore all input events while the goose is dead
    public handleInput(event: GameEvent): void {}

    // Don't update anything about the goose while it's dead
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return; }

}