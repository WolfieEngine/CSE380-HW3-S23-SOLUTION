import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { PlayerTweens } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Dead extends PlayerState {

    public onEnter(options: Record<string, any>): void {
        this.owner.tweens.play(PlayerTweens.DEATH);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
    
}