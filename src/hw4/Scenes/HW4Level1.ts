import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import HW4Level from "./HW4Level";
import { HW4Sprites, HW4PlayerSpritesheet, HW4GooseSpritesheet, HW4Sounds, HW4Level1Tilemap } from "../HW4Resources";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import MainMenu from "./MainMenu";
import HW4Level2 from "./HW4Level2";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level1 extends HW4Level {

    public static readonly PLAYER_SPAWN: Vec2 = new Vec2(32, 32);
    public static readonly PLAYER_SPRITE_KEY: string = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH: string = "hw4_assets/spritesheets/Peter.json";

    public static readonly TILEMAP_KEY: string = "LEVEL1";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly DESTRUCTIBLE_LAYER_KEY: string = "Destructable";
    public static readonly WALLS_LAYER_KEY: string = "Main";

    public static readonly LEVEL_MUSIC_KEY: string = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH: string = "hw4_assets/music/hw5_level_music.wav";

    public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    public static readonly TILE_DESTROYED_KEY = "TILE_DESTROYED";
    public static readonly TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(224, 232), new Vec2(24, 16));

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level1.TILEMAP_KEY;
        this.tilemapScale = Level1.TILEMAP_SCALE;
        this.destructibleLayerKey = Level1.DESTRUCTIBLE_LAYER_KEY;
        this.wallsLayerKey = Level1.WALLS_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level1.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level1.PLAYER_SPAWN;

        // Music and sound
        this.levelMusicKey = Level1.LEVEL_MUSIC_KEY
        this.jumpAudioKey = Level1.JUMP_AUDIO_KEY;
        this.tileDestroyedAudioKey = Level1.TILE_DESTROYED_KEY;

        // Level end size and position
        this.levelEndPosition = new Vec2(32, 216).mult(this.tilemapScale);
        this.levelEndHalfSize = new Vec2(32, 32).mult(this.tilemapScale);
    }

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, HW4Level1Tilemap.PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, Level1.PLAYER_SPRITE_PATH);
        
        // Audio and music
        this.load.audio(this.levelMusicKey, Level1.LEVEL_MUSIC_PATH);
        this.load.audio(this.jumpAudioKey, Level1.JUMP_AUDIO_PATH);

        this.load.audio(this.tileDestroyedAudioKey, Level1.TILE_DESTROYED_PATH);
    }

    public startScene(): void {
        super.startScene();
        this.nextLevel = HW4Level2;
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

}