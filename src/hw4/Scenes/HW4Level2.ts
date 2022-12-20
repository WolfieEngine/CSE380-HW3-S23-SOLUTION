import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../Wolfie2D/Scene/Scene";
import HW4Level from "./HW4Level";
import MainMenu from "./MainMenu";

import { 
    HW4Sounds, HW4Sprites, HW4Level2Tilemap, 
    HW4GooseSpritesheet, HW4PlayerSpritesheet 
} from "../HW4Resources";

/**
 * The second level for HW4. It should be the goose dungeon / cave.
 */
export default class Level2 extends HW4Level {

    public static readonly LEVEL_END = new AABB(new Vec2(224, 232), new Vec2(24, 16));
    public static readonly MAP_SCALE = new Vec2(2, 2);

    /**
     * Load in resources for level 2.
     */
    public loadScene(): void {
        this.load.tilemap(HW4Level2Tilemap.KEY, HW4Level2Tilemap.PATH);
    }

    protected getLevelEnds(): [{ position: Vec2; size: Vec2; }] {
        return [
            { position: new Vec2(200, 216).mult(Level2.MAP_SCALE), size: new Vec2(32, 32).mult(Level2.MAP_SCALE) }
        ]
    }
    protected getTilemapData(): { key: string; scale: Vec2; } {
        return { key: HW4Level2Tilemap.KEY, scale: new Vec2(2, 2) }
    }


    protected getWalls(): OrthogonalTilemap {
        return this.getTilemap(HW4Level2Tilemap.MAIN) as OrthogonalTilemap;
    }
    protected getDestructible(): OrthogonalTilemap {
        return this.getTilemap(HW4Level2Tilemap.DESTRUCTIBLE) as OrthogonalTilemap;
    }

    protected getPlayerSpawn(): Vec2 {
        return new Vec2(32, 32).mult(Level2.MAP_SCALE);
    }

    protected getGeesePositions(): Vec2[] {
        return [
            new Vec2(64, 144),
            new Vec2(160, 152),
            new Vec2(48, 240),
            new Vec2(88, 240),
            new Vec2(128, 240)
        ].map(pos => pos.mult(Level2.MAP_SCALE));
    }

    protected getPlayerSpriteKey(): string { return HW4PlayerSpritesheet.KEY; }
    protected getWeaponSpriteKey(): string { return HW4Sprites.WEAPON_KEY; }
    protected getGooseSpriteKey(): string { return HW4GooseSpritesheet.KEY; }
    protected getNextLevel(): new (...args: any[]) => Scene { return MainMenu; }
    protected getLevelMusic(): string { return HW4Sounds.LEVEL_MUSIC_KEY; }
    protected getGooseHitKey(): string { return HW4Sounds.HIT_AUDIO_KEY }
    protected getPlayerDeathKey(): string { return HW4Sounds.DEATH_AUDIO_KEY; }
    protected getTileDestroyedKey(): string { return HW4Sounds.TILE_DESTROYED_KEY; }
}