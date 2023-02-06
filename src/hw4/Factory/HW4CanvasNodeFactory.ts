import CanvasNodeFactory from "../../Wolfie2D/Scene/Factories/CanvasNodeFactory";
import HW4AnimatedSprite from "../Nodes/HW4AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";

export default class HW3CanvasNodeFactory extends CanvasNodeFactory {

    protected scene: HW4Level;
    
    public init(scene: HW4Level): void {
        super.init(scene);
    }

    public addHW4AnimatedSprite = (key: string, layerName: string) => {
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