import Tilemap from "../../Wolfie2D/Nodes/Tilemap";
import FactoryManager from "../../Wolfie2D/Scene/Factories/FactoryManager";
import HW4AnimatedSprite from "../Nodes/HW4AnimatedSprite";
import HW4Level from "../Scenes/HW4Level";
import HW4CanvasNodeFactory from "./HW4CanvasNodeFactory";

export default class HW4FactoryManager extends FactoryManager {

    private hw3CanvasNodeFactory: HW4CanvasNodeFactory;

    public constructor(scene: HW4Level, tilemaps: Tilemap[]) {
        super(scene, tilemaps)
        this.hw3CanvasNodeFactory = new HW4CanvasNodeFactory();
        this.hw3CanvasNodeFactory.init(scene);
    }

    public hw3AnimatedSprite(key: string, layerName: string): HW4AnimatedSprite {
        return this.hw3CanvasNodeFactory.addHW4AnimatedSprite(key, layerName);
    }
}