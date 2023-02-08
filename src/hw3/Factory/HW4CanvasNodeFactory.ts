import CanvasNodeFactory from "../../Wolfie2D/Scene/Factories/CanvasNodeFactory";
import HW4AnimatedSprite from "../Nodes/HW4AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";

/**
 * An extension of Wolfie2ds CanvasNodeFactory. The purpose of the class is to add functionality for adding custom
 * game nodes to HW4Levels. 
 */
export default class HW3CanvasNodeFactory extends CanvasNodeFactory {

    // Reference to the HW4Level
    protected scene: HW4Level;
    
    // Overriden to only accept HW4Levels
    public init(scene: HW4Level): void { super.init(scene); }

    // Overriden to return HW4AnimatedSprites instead of regular AnimatedSprites
    public addAnimatedSprite = (key: string, layerName: string): HW4AnimatedSprite => {
        let layer = this.scene.getLayer(layerName);
		let spritesheet = this.resourceManager.getSpritesheet(key);
		let instance = new HW4AnimatedSprite(spritesheet);

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