import CanvasNodeFactory from "../../Wolfie2D/Scene/Factories/CanvasNodeFactory";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import HW3Level from "../Scenes/HW3Level";

/**
 * An extension of Wolfie2ds CanvasNodeFactory. The purpose of the class is to add functionality for adding custom
 * game nodes to HW3Levels. 
 */
export default class HW3CanvasNodeFactory extends CanvasNodeFactory {

    // Reference to the HW4Level
    protected scene: HW3Level;
    
    // Overriden to only accept HW4Levels
    public init(scene: HW3Level): void { super.init(scene); }

    // Overriden to return HW3AnimatedSprites instead of regular AnimatedSprites
    public addAnimatedSprite = (key: string, layerName: string): HW3AnimatedSprite => {
        let layer = this.scene.getLayer(layerName);
		let spritesheet = this.resourceManager.getSpritesheet(key);
		let instance = new HW3AnimatedSprite(spritesheet);

		// Add instance fo scene
		instance.setScene(this.scene);
		instance.id = this.scene.generateId();
		
		if(!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))){
			this.scene.getSceneGraph().addNode(instance);
		}

		// Add instance to layer
		layer.addNode(instance);

		return instance;
    }
}