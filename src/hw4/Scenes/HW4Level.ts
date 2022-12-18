import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
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
import { HW5_Events } from "../hw5_enums";
import HW5_ParticleSystem from "../HW5_ParticleSystem";
import PlayerController from "../Player/PlayerController";
import MainMenu from "./MainMenu";

export enum HW4Layers {
    // The primary layer in the HW4Scene
    PRIMARY = "PRIMARY",
    // The UI layer in the HW4Scene
    UI = "UI"
}

export enum HW4PhysicsGroups {
    // Physics groups for the geese and their "weapons"
    GOOSE = "GOOSE",
    GOOSE_WEAPON = "GOOSE_WEAPON",
    // Physics groups for the player and the player's weapon
    PLAYER = "PLAYER",
    PLAYER_WEAPON = "WEAPON",
    /* 
        Physics groups for the different tilemap layers. Physics groups for tilemaps are
        embedded in the tilemap layer data by a property called "Group". This lets you
        set the physics group for a particular tilemap layer.
    */
    GROUND = "GROUND",
    DESTRUCTABLE = "DESTRUCTABLE"
}

/**
 * 
 */
export default abstract class HW4Level extends Scene {
    /** The sprite that is player's weapon / particle cannon thing */
    protected playerWeapon: Sprite;
    /** The animated sprite that is the player */
    protected player: AnimatedSprite;
    /** The amount of lives the player starts with */
    protected playerLives: number = 3;

    protected respawnTimer: Timer;

    /** A label for displaying the player's lives in the UI */
    protected livesCountLabel: Label;

    // Stuff to end the level and go to the next level
    protected levelEndArea: Rect;
    protected nextLevel: new (...args: any) => HW4Level;
    protected levelEndTimer: Timer;
    protected levelEndLabel: Label;

    // Screen fade in/out for level start and end
    protected levelTransitionTimer: Timer;
    protected levelTransitionScreen: Rect;


    // Total ballons and amount currently popped
    protected totalBalloons: number;
    protected balloonLabel: Label;
    protected balloonsPopped: number;

    // The object pool for the geese
    protected geese: Array<AnimatedSprite>;
    protected geeseAlive: number;

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

        // Do the game level standard initializations
        this.initLayers();

        this.playerWeapon = this.initializePlayerWeapon(this.getPlayerSpawn());
        this.player = this.initializePlayer(this.getPlayerSpawn());

        this.initViewport();
        this.subscribeToEvents();
        this.addUI();

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

        // Initialize the geese for this scene
        this.geese = this.initializeGeese(this.getGeesePositions());
        // Set the number of geese alive to the number of visisble geese in the scene
        this.geeseAlive = this.geese.filter((goose) => goose.visible).length;
        // Initialize the next level
        this.nextLevel = this.getNextLevel();

        // Initially disable player movement
        Input.disableInput();
        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");
    }


    public updateScene(deltaT: number) {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    /**
     * Handle game events 
     * @param event the game event
     */
    protected handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW5_Events.PLAYER_ENTERED_LEVEL_END: {
                this.handleEnteredLevelEnd(event);
                break;
            }
            case HW5_Events.LEVEL_START: {
                this.handleLevelStart(event);
                break;
            }
            case HW5_Events.LEVEL_END: {
                this.handleLevelEnd(event);
                break;
            }
            case HW5_Events.PLAYER_KILLED: {
                this.handlePlayerKilled(event);
                break;
            }
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }

    /**
     * Handle a level-start event. When the level starts, we should re-enable
     * user input events.
     */
    protected handleLevelStart(event: GameEvent): void {
        Input.enableInput();
    }
    /**
     * Handles a player killed event. When the player is killed, try to 
     * respawn the player.
     */
    protected handlePlayerKilled(event: GameEvent) {
        this.respawnPlayer();
    }
    /**
     * Handles a level-end event. When the level ends, transition to the next level.
     */
    protected handleLevelEnd(event: GameEvent): void {
        this.sceneManager.changeToScene(this.nextLevel);
    }
    /**
     * Handle when the player enters the level end area.
     */
    protected handleEnteredLevelEnd(event: GameEvent): void {
        if (!this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
            // The player has reached the end of the level
            this.levelEndTimer.start();
            this.levelEndLabel.tweens.play("slideIn");
        }
    }

    // Initialization stuff


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
     * Initializes the viewport
     */
    protected initViewport(): void {
        this.viewport.setZoomLevel(2);
    }
    /**
     * Handles all subscriptions to events
     */
    protected subscribeToEvents() {
        this.receiver.subscribe([
            HW5_Events.PLAYER_HIT_SWITCH,
            HW5_Events.PLAYER_HIT_BALLOON,
            HW5_Events.BALLOON_POPPED,
            HW5_Events.PLAYER_ENTERED_LEVEL_END,
            HW5_Events.LEVEL_START,
            HW5_Events.LEVEL_END,
            HW5_Events.PLAYER_KILLED
        ]);
    }
    /**
     * Adds in any necessary UI to the game
     */
    protected addUI() {
        // In-game labels
        this.balloonLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(80, 30), text: "Balloons Left: " + (this.totalBalloons - this.balloonsPopped) });
        this.balloonLabel.textColor = Color.BLACK
        this.balloonLabel.font = "PixelSimple";

        this.livesCountLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(500, 30), text: "Lives: " + this.playerLives });
        this.livesCountLabel.textColor = Color.BLACK;
        this.livesCountLabel.font = "PixelSimple";

        // End of level label (start off screen)
        this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW4Layers.UI, { position: new Vec2(-300, 200), text: "Level Complete" });
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

        // Create our particle system and initialize the pool
        // this.system = new HW5_ParticleSystem(100, new Vec2((5 * 32), (10 * 32)), 2000, 3, 1, 100);
        // this.system.initializePool(this, "primary");

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
            onEnd: HW5_Events.LEVEL_END
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
            onEnd: HW5_Events.LEVEL_START
        });
    }

    protected initializePlayerWeapon(position: Vec2): Sprite {
        let weapon = this.add.sprite("weapon", HW4Layers.PRIMARY);
        weapon.scale.set(2, 2);
        weapon.position.copy(position);
        return weapon;
    }

    /**
     * Initializes the player, setting the player's initial position to the given position.
     */
    protected initializePlayer(position: Vec2): AnimatedSprite {
        // Add the player
        let player = this.add.animatedSprite("player", HW4Layers.PRIMARY);

        player.scale.set(3, 3);
        player.position.copy(position);
        player.addPhysics(new AABB(player.position.clone(), player.boundary.getHalfSize().clone()));
        player.addAI(PlayerController, { weapon: this.playerWeapon , tilemap: "Destructable" });

        player.setGroup(HW4PhysicsGroups.PLAYER);
        player.animation.play("IDLE");

        this.viewport.follow(player);
        return player;
    }
    /**
     * Gets the player's spawn position from an actual HW4 game level.
     */
    protected abstract getPlayerSpawn(): Vec2;

    /**
     * A method for initializing the geese in a HW4 level.
     * @returns an array of animated sprites (the geese) in this scene.
     */
    protected initializeGeese(positions: Vec2[]): Array<AnimatedSprite> {
        let geese = new Array<AnimatedSprite>(positions.length);
        // Add balloons of various types, just red and blue for the first level
        for(let pos of positions){
            let goose = this.add.animatedSprite("goose", HW4Layers.PRIMARY);
            goose.position.copy(pos);
            goose.addPhysics();
            goose.addAI(GooseController, {});
            goose.scale.set(2, 2);
            goose.setGroup(HW4PhysicsGroups.GOOSE);
            goose.setTrigger(HW4PhysicsGroups.PLAYER_WEAPON, "goose_hit_start", null);
            geese.push(goose);
        }
        return geese;
    }
    /**
     * Get the positions to spawn the geese in a HW4 scene
     */
    protected abstract getGeesePositions(): Vec2[];

    /**
     * Initializes the level end area
     */
    protected addLevelEnd(startingTile: Vec2, size: Vec2, tileSize: Vec2, ): void {
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, HW4Layers.PRIMARY, { position: startingTile.mult(tileSize), size: size.mult(tileSize) });
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger(HW4PhysicsGroups.PLAYER, HW5_Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEndArea.color = new Color(0, 0, 0, 0);
    }


    /**
     * Increments the amount of life the player has
     * @param amt The amount to add to the player life
     */
    protected incPlayerLife(amt: number): void {
        this.playerLives += amt;
        this.livesCountLabel.text = "Lives: " + this.playerLives;
        if (this.playerLives === 0) {
            Input.disableInput();
            this.player.disablePhysics();
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_death", loop: false, holdReference: false });
            this.player.tweens.play("death");
        }
    }

    /**
     * Returns the player to spawn
     */
    protected respawnPlayer(): void {
        this.playerLives = 3;
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "level_music" });
        this.sceneManager.changeToScene(MainMenu, {});
        Input.enableInput();
    }

    /**
     * Gets the next level this level should transition to
     * @returns the constructor for the next HW4Level
     */
    protected abstract getNextLevel(): new (...args: any[]) => HW4Level;
}