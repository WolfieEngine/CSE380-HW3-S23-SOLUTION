import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import Scene from "../../Wolfie2D/Scene/Scene";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import GooseController from "../Goose/GooseController";
import PlayerController, { PlayerTweens } from "../Player/PlayerController";
import PlayerWeapon from "../Player/PlayerWeapon";
import MainMenu from "./MainMenu";

import { HW4Events } from "../HW4Events";
import { HW4PhysicsGroups } from "../HW4PhysicsGroups";
import { HW4Sounds } from "../HW4Resources";

/**
 * Enums for the layers in a HW4Level
 */
export enum HW4Layers {
    // The primary layer in the HW4Scene 
    PRIMARY = "PRIMARY",
    // The UI layer in the HW4Scene
    UI = "UI"
}

/**
 * An abstract HW4 scene. 
 */
export default abstract class HW4Level extends Scene {
    /** The sprite that is player's weapon / particle cannon thing */
    protected playerWeaponSprite: Sprite;
    /** The particle system used for the player's weapon */
    protected playerWeaponSystem: PlayerWeapon
    /** The animated sprite that is the player */
    protected player: AnimatedSprite;
    /** The amount of lives the player starts with */
    protected playerLives: number = 3;

    protected respawnTimer: Timer;

    /** A label for displaying the player's lives in the UI */
    protected livesCountLabel: Label;

    // Stuff to end the level and go to the next level
    protected levelEndArea: Rect;
    protected nextLevel: new (...args: any) => Scene;
    protected levelEndTimer: Timer;
    protected levelEndLabel: Label;

    // Screen fade in/out for level start and end
    protected levelTransitionTimer: Timer;
    protected levelTransitionScreen: Rect;


    // The object pool for the geese
    protected geese: Array<AnimatedSprite>;
    // The number of geese alive
    protected geeseAlive: number;
    // A label for the number of geeese alive
    protected geeseLabel: Label;

    // The destrubtable layer of the tilemap
    protected destructable: OrthogonalTilemap;
    // The wall layer of the tilemap
    protected walls: OrthogonalTilemap;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        /*
            Init the scene with physics collisions:

                        ground  player  weapon 
            ground    No       --      -- 
            player    Yes      No      --  
            weapon   Yes      No      No  

            Each layer becomes a number. In this case, 4 bits matter for each

            ground:  self - 000, collisions - 011
            player:  self - 001, collisions - 100
            balloon: self - 010, collisions - 000
        */
    
        super(viewport, sceneManager, renderingManager, {...options, physics: {
            groupNames: [
                HW4PhysicsGroups.GROUND, 
                HW4PhysicsGroups.PLAYER, 
                HW4PhysicsGroups.PLAYER_WEAPON, 
                HW4PhysicsGroups.DESTRUCTABLE, 
                HW4PhysicsGroups.GOOSE
            ],
            collisions:
            [
                [0, 1, 1, 0, 1],
                [1, 0, 0, 1, 1],
                [1, 0, 0, 1, 0],
                [0, 1, 1, 0, 1],
                [1, 1, 0, 1, 0]
            ]
        }});
    }

    public startScene(): void {
        // Initialize the layers
        this.initLayers();

        // Initialize the tilemaps
        let tilemapData = this.getTilemapData();
        this.initializeTilemap(tilemapData.key, tilemapData.scale);

        // Initialize the sprite and particle system for the players weapon 
        this.initializeWeaponSprite(this.getWeaponSpriteKey());
        this.initializeWeaponSystem();

        // Initialize the player 
        this.initializePlayer(this.getPlayerSpriteKey());

        // Initialize the geese for this scene
        this.geese = this.initializeGeese(this.getGooseSpriteKey(), this.getGeesePositions());
        // Set the number of geese alive to the number of visisble geese in the scene
        this.geeseAlive = this.geese.filter((goose) => goose.visible).length;

        // Initialize the next level
        this.nextLevel = this.getNextLevel();

        // Initialize the viewport - this must come after the player has been initialized
        this.initializeViewport();
        this.subscribeToEvents();
        this.initializeUI();

        // Initialize the ends of the levels - must be initialized after the primary layer has been added
        this.initializeLevelEnds();

        // Initialize the timers
        this.respawnTimer = new Timer(1000, () => {
            if (this.playerLives === 0) {
                this.sceneManager.changeToScene(MainMenu);
            } else {
                this.respawnPlayer();
                this.player.enablePhysics();
                this.player.unfreeze();
            }
        });
        this.levelTransitionTimer = new Timer(500);
        this.levelEndTimer = new Timer(3000, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
        });


        // Initially disable player movement
        Input.disableInput();

        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Start playing the level music for the HW4 level
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.getLevelMusic(), loop: true, holdReference: true});
    }

    /* Update method for the scene plus a helper method for checking particle collisions */

    public updateScene(deltaT: number) {
        // Handle all game events
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        // Check for particle collisions with the destructible layer
        this.checkParticleCollisions();
    }
    /**
     * Handles checking for and resolving collisions between particles and the destructible
     * layer of the tilemap.
     * 
     * When a particle collides with a tile in the destructible layer of the map, the tile should
     * be removed from the map.
     */
    protected checkParticleCollisions(): void {

        // Get the destructable tilemap
        let tilemap = this.destructable;

        // Iterate over the particles in the player's particle weapon
        for (let particle of this.playerWeaponSystem.getPool()) {
            // If the particle is colliding with the tilemap
            if (particle.collidedWithTilemap) {

                let min = new Vec2(particle.sweptRect.left, particle.sweptRect.top);
                let max = new Vec2(particle.sweptRect.right, particle.sweptRect.bottom);

                // Convert the min/max x/y to the min and max row/col in the tilemap array
                let minIndex = tilemap.getColRowAt(min);
                let maxIndex = tilemap.getColRowAt(max);

                let tileSize = tilemap.getTileSize();

                // Loop over all possible tiles the particle could be colliding with 
                for(let col = minIndex.x; col <= maxIndex.x; col++){
                    for(let row = minIndex.y; row <= maxIndex.y; row++){

                        // If the tile is collideable -> check if this particle is colliding with the tile
                        if(tilemap.isTileCollidable(col, row)){

                            // Get the position of this tile
                            let tilePos = new Vec2(col * tileSize.x + tileSize.x/2, row * tileSize.y + tileSize.y/2);
                            // Create a new collider for this tile
                            let collider = new AABB(tilePos, tileSize.scaled(1/2));

                            // Calculate collision area between the node and the tile
                            let area = particle.sweptRect.overlapArea(collider);
                            if(area > 0){
                                // We had a collision - delete the tile in the tilemap
                                tilemap.setTileAtRowCol(new Vec2(col, row), 0);
                                // Play a sound when we destroy the tile
                                this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: this.getTileDestroyedKey(), loop: false, holdReference: false });
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Handle game events. 
     * @param event the game event
     */
    protected handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW4Events.PLAYER_ENTERED_LEVEL_END: {
                this.handleEnteredLevelEnd(event);
                break;
            }
            // When the level starts, reenable user input
            case HW4Events.LEVEL_START: {
                Input.enableInput();
                break;
            }
            // When the level ends, change the scene to the next level
            case HW4Events.LEVEL_END: {
                this.sceneManager.changeToScene(this.nextLevel);
                break;
            }
            case HW4Events.PLAYER_KILLED: {
                this.handlePlayerKilled(event);
                break;
            }
            case HW4Events.GOOSE_HIT_PLAYER: {
                this.handlePlayerHitGoose(event);
                break;
            }
            case HW4Events.GOOSE_DIED: {
                this.handleGooseKilled(event);
                break;
            }
            // Default: Throw an error! No unhandled events allowed.
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }

    /* Handlers for the different events the scene is subscribed to */

    /**
     * Handle when the player enters the level end area.
     */
    protected handleEnteredLevelEnd(event: GameEvent): void {
        // If there are no more geese and the timer hasn't run yet, start the end level animation
        if (this.geeseAlive === 0 && !this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
            this.levelEndTimer.start();
            this.levelEndLabel.tweens.play("slideIn");
        }
    }
    /**
     * Handles a player killed event. When the player is killed, try to 
     * respawn the player.
     */
    protected handlePlayerKilled(event: GameEvent) {
        this.respawnPlayer();
    }
    /**
     * Handles the GameEvent triggered when a goose starts colliding with the player.
     * @param event the event
     */
    protected handlePlayerHitGoose(event: GameEvent): void {
        // Decrement the player's lives
        this.playerLives -= 1;
        // Update the player's lives in the UI
        this.livesCountLabel.text = "Lives: " + this.playerLives;

        // If the player is out of lives -> play the player's death animation and sound and go to the main menu
        if (this.playerLives === 0) {
            Input.disableInput();
            this.player.disablePhysics();
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: this.getPlayerDeathKey(), loop: false, holdReference: false });
            this.player.tweens.play(PlayerTweens.DEATH);
        }
    }
    /**
     * Handles a GOOSE_DIED event.
     * @param event a goose-killed event
     */
    protected handleGooseKilled(event: GameEvent): void {
        // Update the geese alive in the scene and the UI
        this.geeseAlive -= 1;
        this.geeseLabel.text = "Geese Left: " + this.geeseAlive;
        // Play the goose hurt/killed sound effect
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.getGooseHitKey(), loop: false, holdReference: false})
    }

    /* Initialization methods for everything in the scene */

    /**
     * Initialzes the layers
     */
    protected initLayers(): void {
        // Add a layer for UI
        this.addUILayer(HW4Layers.UI);
        // Add a layer for players and enemies
        this.addLayer(HW4Layers.PRIMARY);
    }
    /**
     * Initializes the tilemap for a HW4 scene.
     * @param key the key for the tilemap data
     * @param scale the scale factor for the tilemap
     */
    protected initializeTilemap(key: string, scale?: Vec2): void {
        // Add the tilemap to the scene
        this.add.tilemap(key, scale);
        // Get the wall and destructible layers 
        this.walls = this.getWalls();
        this.destructable = this.getDestructible();
    }
    /**
     * Handles all subscriptions to events
     */
    protected subscribeToEvents(): void {
        this.receiver.subscribe(HW4Events.PLAYER_ENTERED_LEVEL_END);
        this.receiver.subscribe(HW4Events.LEVEL_START);
        this.receiver.subscribe(HW4Events.LEVEL_END);
        this.receiver.subscribe(HW4Events.PLAYER_KILLED);
        this.receiver.subscribe(HW4Events.GOOSE_HIT_PLAYER);
        this.receiver.subscribe(HW4Events.GOOSE_DIED);
    }
    /**
     * Adds in any necessary UI to the game
     */
    protected initializeUI(): void {
        // In-game labels
        this.geeseLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(40, 30), text: "Geese Left: " + this.geeseAlive });
        this.geeseLabel.textColor = Color.BLACK
        this.geeseLabel.font = "PixelSimple";
        this.geeseLabel.fontSize = 20;

        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(40, 50), text: "Lives: " + this.playerLives });
        this.livesCountLabel.textColor = Color.BLACK;
        this.livesCountLabel.font = "PixelSimple";
        this.livesCountLabel.fontSize = 20;

        // End of level label (start off screen)
        this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(-300, 100), text: "Level Complete" });
        this.levelEndLabel.size.set(1200, 60);
        this.levelEndLabel.borderRadius = 0;
        this.levelEndLabel.backgroundColor = new Color(34, 32, 52);
        this.levelEndLabel.textColor = Color.WHITE;
        this.levelEndLabel.fontSize = 48;
        this.levelEndLabel.font = "PixelSimple";

        // Add a tween to move the label on screen
        this.levelEndLabel.tweens.add("slideIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: -300,
                    end: 300,
                    ease: EaseFunctionType.OUT_SINE
                }
            ]
        });

        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, HW4Layers.UI, { position: new Vec2(300, 200), size: new Vec2(600, 400) });
        this.levelTransitionScreen.color = new Color(34, 32, 52);
        this.levelTransitionScreen.alpha = 1;

        this.levelTransitionScreen.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW4Events.LEVEL_END
        });

        /*
             Adds a tween to fade in the start of the level. After the tween has
             finished playing, a level start event gets sent to the EventQueue.
        */
        this.levelTransitionScreen.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW4Events.LEVEL_START
        });
    }
    /**
     * Initializes the player's weapon sprite
     * @param key the key for the weapon sprite image
     */
    protected initializeWeaponSprite(key: string): void {
        this.playerWeaponSprite = this.add.sprite(key, HW4Layers.PRIMARY);
        this.playerWeaponSprite.scale.set(1/2, 1/2);
        this.playerWeaponSprite.position.copy(this.getPlayerSpawn());
    }
    /**
     * Initializes the particles system used by the player's weapon.
     */
    protected initializeWeaponSystem(): void {
        this.playerWeaponSystem = new PlayerWeapon(50, Vec2.ZERO, 1000, 3, 0, 50);
        this.playerWeaponSystem.initializePool(this, HW4Layers.PRIMARY);
    }
    /**
     * Initializes the player, setting the player's initial position to the given position.
     * @param position the player's spawn position
     */
    protected initializePlayer(key: string): void {
        if (this.playerWeaponSprite === undefined) {
            throw new Error("Player weapon sprite must be initialized before initializing the player!");
        }
        if (this.playerWeaponSystem === undefined) {
            throw new Error("Player weapon system must be initialized before initializing the player!");
        }

        // Add the player to the scene
        this.player = this.add.animatedSprite(key, HW4Layers.PRIMARY);
        this.player.scale.set( 1, 1);
        this.player.position.copy(this.getPlayerSpawn());
        
        // Give the player physics and setup collision groups and triggers for the player
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()));
        this.player.setGroup(HW4PhysicsGroups.PLAYER);
        this.player.setTrigger(HW4PhysicsGroups.GOOSE, HW4Events.GOOSE_HIT_PLAYER, null);

        // Give the player a flip animation
        this.player.tweens.add(PlayerTweens.FLIP, {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: 2*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
        // Give the player a death animation
        this.player.tweens.add(PlayerTweens.DEATH, {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW4Events.PLAYER_KILLED
        });

        // Give the player it's AI
        this.player.addAI(PlayerController, { 
            weaponSprite: this.playerWeaponSprite,
            weaponSystem: this.playerWeaponSystem, 
            tilemap: "Destructable" 
        });
    }
    /**
     * Initializes the viewport
     */
    protected initializeViewport(): void {
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(4);
        this.viewport.setBounds(0, 0, 512, 512);
    }
    /**
     * A method for initializing the geese in a HW4 level.
     * @returns an array of animated sprites (the geese) in this scene.
     */
    protected initializeGeese(key: string, positions: Vec2[]): Array<AnimatedSprite> {
        // The object pool of geese for the scene
        let geese = new Array<AnimatedSprite>(positions.length);

        for (let i = 0; i < geese.length; i++) {
            // Add the goose to the scene
            let goose = this.add.animatedSprite(key, HW4Layers.PRIMARY);
            goose.position.copy(positions[i]);
            goose.scale.set(1/2, 1/2);

            // Give the goose it's physics and setup collision groups and triggers for the goose
            goose.addPhysics();
            goose.setGroup(HW4PhysicsGroups.GOOSE);
            goose.setTrigger(HW4PhysicsGroups.PLAYER_WEAPON, HW4Events.WEAPON_HIT_GOOSE, null);

            // Give the goose it's AI
            goose.addAI(GooseController, {});
            geese[i] = goose;
        }
        return geese;
    }
    /**
     * Initializes the level end area
     */
    protected initializeLevelEnds(): void {
        if (!this.layers.has(HW4Layers.PRIMARY)) {
            throw new Error("Can't initialize the level ends until the primary layer has been added to the scene!");
        }

        let rects = this.getLevelEnds();
        for (let rect of rects) {
            this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, HW4Layers.PRIMARY, { position: rect.position, size: rect.size });
            this.levelEndArea.addPhysics(undefined, undefined, false, true);
            this.levelEndArea.setTrigger(HW4PhysicsGroups.PLAYER, HW4Events.PLAYER_ENTERED_LEVEL_END, null);
            this.levelEndArea.color = new Color(0, 0, 0, 0);
        }
    }
    /**
     * Returns the player to spawn
     */
    protected respawnPlayer(): void {
        this.playerLives = 3;
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.getLevelMusic() });
        this.sceneManager.changeToScene(MainMenu, {});
        Input.enableInput();
    }

    /* Abstract methods for getting/doing things specific to the level (Level1 or Level2) */

    /**
     * @returns the player's spawn position for the HW4Level as a Vec2.
     */
    protected abstract getPlayerSpawn(): Vec2;
    /**
     * @returns the positions to spawn the geese as an array of Vec2s.
     */
    protected abstract getGeesePositions(): Vec2[];
    /**
     * @returns the constructor for the next HW4Level to load after this level
     */
    protected abstract getNextLevel(): new (...args: any[]) => Scene;
    /**
     * @returns the indestructible layer of the HW4 tilemap as an OrthogonalTilemap
     */
    protected abstract getWalls(): OrthogonalTilemap;
    /**
     * @returns the destructible layer of the HW4 tilemap as an OrthogonalTilemap 
     */
    protected abstract getDestructible(): OrthogonalTilemap;
    /**
     * @returns an object with the key to the tilemap data for this HW4Level
     * and the scale factor for the tilemap as a Vec2 object.
     */
    protected abstract getTilemapData(): {key: string, scale: Vec2};

    protected abstract getLevelEnds(): [{position: Vec2, size: Vec2}];

    /**
     * @returns the key associated with the level music for this HW4Level
     */
    protected abstract getLevelMusic(): string;
    /**
     * @returns the key associated with the player's sprite for this HW4Level
     */
    protected abstract getPlayerSpriteKey(): string;
    /**
     * @returns the key associated with the goose sprite for this HW4Level
     */
    protected abstract getGooseSpriteKey(): string;
    /**
     * @returns the key associated with the player's weapon sprite for this HW4Level
     */
    protected abstract getWeaponSpriteKey(): string;
    /**
     * @returns the key associated with the sound effect that should be played when a 
     * goose is hit/dies.
     */
    protected abstract getGooseHitKey(): string;
    /**
     * @returns the key associated with the sound effect that should be played when the player dies.
     */
    protected abstract getPlayerDeathKey(): string;

    /**
     * @returns the key associated with the sound effect that should be player when a tile in the
     * destructible layer of the tilemap is destroyed.
     */
    protected abstract getTileDestroyedKey(): string;

}