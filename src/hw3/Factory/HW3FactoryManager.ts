import Graphic from "../../Wolfie2D/Nodes/Graphic";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Tilemap from "../../Wolfie2D/Nodes/Tilemap";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import FactoryManager from "../../Wolfie2D/Scene/Factories/FactoryManager";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import HW3Level, { HW3Layer } from "../Scenes/HW3Level";
import HW4CanvasNodeFactory from "./HW3CanvasNodeFactory";

/**
 * An extension of Wolfie2ds FactoryManager. I'm creating a more specific factory for my custom HW3Level. If you want to get custom
 * GameNodes into your scenes (with more specific properties) you'll have to extend the factory classes.
 */
export default class HW3FactoryManager extends FactoryManager {

    private hw3CanvasNodeFactory: HW4CanvasNodeFactory;

    public constructor(scene: HW3Level, tilemaps: Tilemap[]) {
        super(scene, tilemaps)
        this.hw3CanvasNodeFactory = new HW4CanvasNodeFactory();
        this.hw3CanvasNodeFactory.init(scene);
    }

    public animatedSprite(key: string, layerName: HW3Layer): HW3AnimatedSprite {
        return this.hw3CanvasNodeFactory.addAnimatedSprite(key, layerName);
    }

    public uiElement(type: string, layerName: HW3Layer, options?: Record<string, any>): UIElement {
        return super.uiElement(type, layerName, options);
    }

    public graphic(type: string, layerName: HW3Layer, options?: Record<string, any>): Graphic {
        return super.graphic(type, layerName, options);
    }

    public sprite(key: string, layerName: HW3Layer): Sprite {
        return super.sprite(key, layerName);
    }
}