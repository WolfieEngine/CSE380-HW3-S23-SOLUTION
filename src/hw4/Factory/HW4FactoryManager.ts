import Tilemap from "../../Wolfie2D/Nodes/Tilemap";
import FactoryManager from "../../Wolfie2D/Scene/Factories/FactoryManager";
import HW4AnimatedSprite from "../Nodes/HW4AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";
import HW4CanvasNodeFactory from "./HW4CanvasNodeFactory";

/**
 * An extension of Wolfie2ds FactoryManager. I'm creating a more specific factory for my custom HW4Level. If you want to get custom
 * GameNodes into your scenes (with more specific properties) you'll have to extend the factory classes.
 */
export default class HW4FactoryManager extends FactoryManager {

    private hw3CanvasNodeFactory: HW4CanvasNodeFactory;

    public constructor(scene: HW4Level, tilemaps: Tilemap[]) {
        super(scene, tilemaps)
        this.hw3CanvasNodeFactory = new HW4CanvasNodeFactory();
        this.hw3CanvasNodeFactory.init(scene);
    }

    public animatedSprite(key: string, layerName: string): HW4AnimatedSprite {
        return this.hw3CanvasNodeFactory.addAnimatedSprite(key, layerName);
    }
}