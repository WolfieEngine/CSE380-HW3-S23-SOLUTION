
import InAir from "./InAir";

export default class Fall extends InAir {
    onEnter(options: Record<string, any>): void {
        
    }

    onExit(): Record<string, any> {
		this.owner.animation.stop();
        return {};
    }
}