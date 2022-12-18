import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { HW5_Events } from "../hw5_enums";
import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import InAir from "./PlayerStates/InAir";
import Jump from "./PlayerStates/Jump";
import Walk from "./PlayerStates/Walk";

import WeaponPS from "./PlayerWeapon";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HW4Layers } from "../Scenes/HW4Level";

export enum PlayerType {
    PLATFORMER = "platformer",
    TOPDOWN = "topdown"
}

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
	RUN = "run",
	JUMP = "jump",
    FALL = "fall",
	PREVIOUS = "previous"
}

export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 300;
    public readonly MIN_SPEED: number = 200;

    protected owner: AnimatedSprite;

    protected _velocity: Vec2 = Vec2.ZERO;
	protected _speed: number = 200;
    protected tilemap: OrthogonalTilemap;
    protected cannon: Sprite;
    protected weapon: WeaponPS;

    
    public initializeAI(owner: AnimatedSprite, options: Record<string, any>){
        this.owner = owner;
        this.cannon = options.weapon;

        // Give the player a flip animation
        owner.tweens.add("flip", {
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
        owner.tweens.add("death", {
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
            onEnd: HW5_Events.PLAYER_KILLED
        });

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;

        // Initialize the different states the player can be in
		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
		this.addState(PlayerStates.WALK, new Walk(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
        this.initialize(PlayerStates.IDLE);

        // Initialize the players particle cannon
        this.weapon = new WeaponPS(100, new Vec2((5 * 32), (10 * 32)), 1000, 3, 0, 100);
        this.weapon.initializePool(this.owner.getScene(), HW4Layers.PRIMARY);
    }

    public changeState(stateName: string): void {
        // If we jump or fall, push the state so we can go back to our current state later
        // unless we're going from jump to fall or something
        if((stateName === PlayerStates.JUMP || stateName === PlayerStates.FALL) && !(this.stack.peek() instanceof InAir)){
            this.stack.push(this.stateMap.get(stateName));
        }

        super.changeState(stateName);
    }

    /** 
	 * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	 */
    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
		direction.x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
		direction.y = (Input.isJustPressed("jump") ? -1 : 0);
		return direction;
    }
    /** 
     * Gets the direction of the mouse from the player's position
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    public update(deltaT: number): void {
		super.update(deltaT);

        // Update the position and location of the cannon sprite to the players position
        this.cannon.position.copy(this.owner.position);
        // Update the cannons rotation - should be firing in same direction as the particles
        this.cannon.rotation = Vec2.UP.angleToCCW(this.faceDir) + Math.PI / 2;

        // Update the rotation to apply the particles velocity vector
        this.weapon.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;

        // If the player hits the attack button and the weapon system isn't running, restart the system and fire!
        if (Input.isPressed("attack") && !this.weapon.isSystemRunning()) {
            // Update the rotation to apply the particles velocity vector
            this.weapon.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.weapon.startSystem(500, 0, this.owner.position);
        }

        if (Input.isMousePressed()) {
            this.tilemap.setTileAtRowCol(this.tilemap.getColRowAt(Input.getGlobalMousePosition()),22);
        }

        if (this.tilemap.getTileAtWorldPosition(this.owner.position.clone().add(new Vec2(0, 32))) == 8) {
            // Fire the hit switch event
            this.emitter.fireEvent(HW5_Events.PLAYER_HIT_SWITCH);

            // Changes the tile from off to on
            this.tilemap.setTileAtRowCol(this.tilemap.getColRowAt(this.owner.position.clone().add(new Vec2(0, 32))), 9);
        }

	}


    public get velocity(): Vec2 { return this._velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }
}