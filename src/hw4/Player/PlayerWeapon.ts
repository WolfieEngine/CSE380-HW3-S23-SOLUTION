import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import { HW4PhysicsGroups } from "../Scenes/HW4Level";

/**
 * The main part of the player's weapon is the particle system.
 */
export default class PlayerWeapon extends ParticleSystem {

    protected _rotation: number = 0;

    public isSystemRunning(): boolean { return this.systemRunning; }

    public get rotation(): number { return this._rotation; }
    public set rotation(rotation: number) { this._rotation = rotation; }

    /**
     * Sets animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        particle.vel = RandUtils.randVec(-32, 32, 400, 500);
        // Rotate the particle's velocity vector
        particle.vel.rotateCCW(this._rotation);
        particle.color = Color.RED;

        // Give the particle tweens
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

    /**
     * Initializes this particle system in the given scene and layer
     * @param scene the scene
     * @param layer the layer in the scene
     */
    public initializePool(scene: Scene, layer: string) {
        super.initializePool(scene, layer);
        for (let i = 0; i < this.particlePool.length; i++) {
            // Set particle physics group to the player's weapon
            this.particlePool[i].setGroup(HW4PhysicsGroups.PLAYER_WEAPON);
        }
    }

    /**
     * Handles updating particle system and each particle in the particle system.
     */
    public update(deltaT: number): void {
        super.update(deltaT);

        for (let i = 0; i < this.particlesToRender; i++) {

            // If a particle from the weapon collided with the tilemap, destroy any tiles the particle hit
            if (this.particlePool[i].collidedWithTilemap) {
                let tilemap = <OrthogonalTilemap>this.particlePool[i].getScene().getTilemap("Destructable");
                let node = this.particlePool[i];

                let min = new Vec2(node.sweptRect.left, node.sweptRect.top);
                let max = new Vec2(node.sweptRect.right, node.sweptRect.bottom);
        
                // Convert the min/max x/y to the min and max row/col in the tilemap array
                let minIndex = tilemap.getColRowAt(min);
                let maxIndex = tilemap.getColRowAt(max);
        
                let tileSize = tilemap.getTileSize();
        
                // Loop over all possible tiles (which isn't many in the scope of the velocity per frame)
                for(let col = minIndex.x; col <= maxIndex.x; col++){
                    for(let row = minIndex.y; row <= maxIndex.y; row++){
                        if(tilemap.isTileCollidable(col, row)){
                            // Get the position of this tile
                            let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);
        
                            // Create a new collider for this tile
                            let collider = new AABB(tilePos, tileSize.scaled(1/2));
        
                            // Calculate collision area between the node and the tile
                            let area = node.sweptRect.overlapArea(collider);
                            if(area > 0){
                                // We had a collision
                                tilemap.setTileAtRowCol(new Vec2(col, row), 0);
                            }
                        }
                    }
                }
            }
        }
    }
}