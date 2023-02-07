import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";

/**
 * An animated sprite in the HW3Level. I have extended the animated sprite to create a more specific sprite
 * with a reference to a HW3Level. One of the things I want to try and show all of you is how to extend
 * Wolfie2d. 
 * 
 * For the HW4AnimatedSprite, I've just overriden the type of the scene and the associated getter/setter
 * methods. Without this, you would have to explicitly cast the type of the scene to a HW4Level to get access
 * to the methods associated with HW4Level. 
 * 
 * - Peter
 */
export default class HW4AnimatedSprite extends AnimatedSprite {

    protected scene: HW4Level;
    
    public setScene(scene: HW4Level): void { this.scene = scene; }
    public getScene(): HW4Level { return this.scene; }
}