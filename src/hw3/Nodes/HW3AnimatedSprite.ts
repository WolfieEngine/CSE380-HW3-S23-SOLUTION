import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import HW3Level from "../Scenes/HW3Level";

/**
 * An animated sprite in the HW3Level. I have extended the animated sprite to create a more specific sprite
 * with a reference to a HW3Level. One of the things I want to try and show all of you is how to extend
 * Wolfie2d. 
 * 
 * For the HW3AnimatedSprite, I've just overriden the type of the scene and the associated getter/setter
 * methods. Without this, you would have to explicitly cast the type of the scene to a HW3Level to get access
 * to the methods associated with HW3Level. 
 * 
 * - Peter
 */
export default class HW3AnimatedSprite extends AnimatedSprite {

    protected scene: HW3Level;
    
    public setScene(scene: HW3Level): void { this.scene = scene; }
    public getScene(): HW3Level { return this.scene; }
}