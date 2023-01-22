import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import HW4Level from "./HW4Level";
import Level2 from "./HW4Level2";
import { HW4Sprites, HW4PlayerSpritesheet, HW4GooseSpritesheet, HW4Sounds, HW4Level1Tilemap } from "../HW4Resources";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level1 extends HW4Level {

    public static readonly LEVEL_END = new AABB(new Vec2(224, 232), new Vec2(24, 16));
    public static readonly MAP_SCALE = new Vec2(2, 2);

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Tilemap
        this.load.tilemap(HW4Level1Tilemap.KEY, HW4Level1Tilemap.PATH);
        // Spritesheets 
        this.load.spritesheet(HW4PlayerSpritesheet.KEY, HW4PlayerSpritesheet.PATH);
        this.load.spritesheet(HW4GooseSpritesheet.KEY, HW4GooseSpritesheet.PATH);
        // Sprites
        this.load.image(HW4Sprites.WEAPON_KEY, HW4Sprites.WEAPON_PATH);
        // Music and sound
        this.load.audio(HW4Sounds.LEVEL_MUSIC_KEY, HW4Sounds.LEVEL_MUSIC_PATH);
        this.load.audio(HW4Sounds.JUMP_AUDIO_KEY, HW4Sounds.JUMP_AUDIO_PATH);
        this.load.audio(HW4Sounds.DEATH_AUDIO_KEY, HW4Sounds.DEATH_AUDIO_PATH);
        this.load.audio(HW4Sounds.TILE_DESTROYED_KEY, HW4Sounds.TILE_DESTROYED_PATH);
        this.load.audio(HW4Sounds.HIT_AUDIO_KEY, HW4Sounds.HIT_AUDIO_PATH);
    }

    /**
     * Unload resources and decide which resources keep for the next scene.
     */
    public unloadScene(){
        // Keep the spritesheets for the player and the goose
        this.load.keepSpritesheet(HW4PlayerSpritesheet.KEY);
        this.load.keepSpritesheet(HW4GooseSpritesheet.KEY);
        // Keep the weapon image
        this.load.keepImage(HW4Sprites.WEAPON_KEY);
        // Keep all the music and the sound
        this.load.keepAudio(HW4Sounds.LEVEL_MUSIC_KEY);
        this.load.keepAudio(HW4Sounds.JUMP_AUDIO_KEY);
        this.load.keepAudio(HW4Sounds.DEATH_AUDIO_KEY);
        this.load.keepAudio(HW4Sounds.TILE_DESTROYED_KEY);
        this.load.keepAudio(HW4Sounds.HIT_AUDIO_KEY);
    }


    protected getTilemapData(): { key: string; scale: Vec2; } {
        return { key: HW4Level1Tilemap.KEY, scale: new Vec2(2, 2) }
    }

    protected getLevelEnds(): [{ position: Vec2; size: Vec2 }] {
        return [
            { position: new Vec2(32, 216).mult(Level1.MAP_SCALE), size: new Vec2(32, 32).mult(Level1.MAP_SCALE) }
        ];
    }

    /**
     * I had to override this method to adjust the viewport for the first level. I screwed up 
     * when I was making the tilemap for the first level is what it boils down to.
     * 
     * PeteyLumpkins
     */
    protected initializeViewport(): void {
        super.initializeViewport();
        this.viewport.setBounds(16, 16, 496, 512);
    }

    protected getPlayerSpawn(): Vec2 {
        return new Vec2(32*2, 32*2);
    }

    protected getNextLevel(): new (...args: any[]) => HW4Level {
        return Level2;
    }

    protected getDestructible(): OrthogonalTilemap {
        return this.getTilemap(HW4Level1Tilemap.DESTRUCTIBLE) as OrthogonalTilemap;
    }
    protected getWalls(): OrthogonalTilemap { 
        return this.getTilemap(HW4Level1Tilemap.MAIN) as OrthogonalTilemap;
    }

    protected getPlayerSpriteKey(): string { return HW4PlayerSpritesheet.KEY; }

    protected getLevelMusic(): string { return HW4Sounds.LEVEL_MUSIC_KEY; }
    protected getPlayerDeathKey(): string { return HW4Sounds.DEATH_AUDIO_KEY; }
    protected getTileDestroyedKey(): string { return HW4Sounds.TILE_DESTROYED_KEY; }
}