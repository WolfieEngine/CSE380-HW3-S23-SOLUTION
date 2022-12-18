import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import HW4Level from "./HW4Level";
import Level2 from "./Level2";

export default class Level1 extends HW4Level {
    
    loadScene(): void {
        // Load resources
        this.load.tilemap("level1", "hw4_assets/tilemaps/HW4-L1.json");
        this.load.spritesheet("player", "hw4_assets/spritesheets/Peter.json");
        this.load.spritesheet("red", "hw4_assets/spritesheets/redBalloon.json");
        this.load.spritesheet("goose", "hw4_assets/spritesheets/goose.json");
        this.load.audio("jump", "hw4_assets/sounds/jump.wav");
        this.load.audio("switch", "hw4_assets/sounds/switch.wav");
        this.load.audio("player_death", "hw4_assets/sounds/player_death.wav");
        this.load.spritesheet("balloon", "hw4_assets/spritesheets/redBalloon.json");

        this.load.image("weapon", "hw4_assets/sprites/Cannon.png");
        this.load.audio("level_music", "hw4_assets/music/hw5bg.mp3");
        this.load.audio("balloon_pop", "hw4_assets/sounds/balloon_fart.mp3");
    }

    // HOMEWORK 5 - TODO
    /**
     * Decide which resource to keep and which to cull.
     * 
     * Check out the resource manager class.
     * 
     * Figure out how to save resources from being unloaded, and save the ones that are needed
     * for level 2.
     * 
     * This will let us cut down on load time for the game (although there is admittedly
     * not a lot of load time for such a small project).
     */
    unloadScene(){
        this.load.keepSpritesheet("player");
        this.load.keepSpritesheet("red");
        this.load.keepSpritesheet("blue");
        this.load.keepAudio("jump");
        this.load.keepAudio("switch");
        this.load.keepAudio("player_death");
        this.load.keepAudio("level_music");
        this.load.keepAudio("balloon_pop");
    }

    startScene(): void {
        // Add the level 1 tilemap
        this.add.tilemap("level1", new Vec2(2, 2));
        this.viewport.setBounds(0, 0, 1024*2, 1024*2);

        this.totalBalloons = 6;

        // Do generic setup for a GameLevel
        super.startScene();

        this.addLevelEnd(new Vec2(60, 13), new Vec2(5, 5), new Vec2(32, 32));

        // for(let pos of [new Vec2(20, 3), new Vec2(41,4), new Vec2(3, 4)]){
        //     this.addBalloon("blue", pos, {color: HW5_Color.BLUE});
        // }
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: "level_music", loop: true, holdReference: true});
    }

    protected getPlayerSpawn(): Vec2 {
        return new Vec2(5*32, 14*32);
    }

    protected getGeesePositions(): Vec2[] {
        return [new Vec2(5*32, 14*32), new Vec2(18, 8), new Vec2(25, 3), new Vec2(52, 5)]
    }

    protected getNextLevel(): new (...args: any[]) => HW4Level {
        return Level2;
    }
}