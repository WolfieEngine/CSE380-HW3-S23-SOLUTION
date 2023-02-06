import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";

export default class HW4AnimatedSprite extends AnimatedSprite {

    protected scene: HW4Level;
    
    public setScene(scene: HW4Level): void {
        this.scene = scene;
    }

    public getScene(): HW4Level {
        return this.scene;
    }
}