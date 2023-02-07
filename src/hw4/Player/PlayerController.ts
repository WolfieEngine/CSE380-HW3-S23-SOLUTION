import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import Jump from "./PlayerStates/Jump";
import Walk from "./PlayerStates/Walk";

import PlayerWeapon from "./PlayerWeapon";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

import { HW4Controls } from "../HW4Controls";
import HW4AnimatedSprite from "../Nodes/HW4AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { HW4Events } from "../HW4Events";
import Dead from "./PlayerStates/Dead";

/**
 * Animation keys for the player spritesheet
 */
export enum PlayerAnimations {
    IDLE = "IDLE",
    WALK = "WALK",
    JUMP = "JUMP",
}

/**
 * Tween animations the player can player.
 */
export enum PlayerTweens {
    FLIP = "FLIP",
    DEATH = "DEATH"
}

/**
 * Keys for the states the PlayerController can be in.
 */
export enum PlayerStates {
    IDLE = "IDLE",
    WALK = "WALK",
	JUMP = "JUMP",
    FALL = "FALL",
    DEAD = "DEAD",
}

export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    protected _health: number;
    protected _maxHealth: number;

    protected owner: HW4AnimatedSprite;

    protected _velocity: Vec2;
	protected _speed: number;

    protected tilemap: OrthogonalTilemap;
    // protected cannon: Sprite;
    protected weapon: PlayerWeapon;

    
    public initializeAI(owner: HW4AnimatedSprite, options: Record<string, any>){
        this.owner = owner;

        this.weapon = options.weaponSystem;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 10
        this.maxHealth = 10;

        // Add the different states the player can be in to the PlayerController 
		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
		this.addState(PlayerStates.WALK, new Walk(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        // Start the player in the Idle state
        this.initialize(PlayerStates.IDLE);
    }

    /** 
	 * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	 */
    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
		direction.x = (Input.isPressed(HW4Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW4Controls.MOVE_RIGHT) ? 1 : 0);
		direction.y = (Input.isJustPressed(HW4Controls.JUMP) ? -1 : 0);
		return direction;
    }
    /** 
     * Gets the direction of the mouse from the player's position
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    public update(deltaT: number): void {
		super.update(deltaT);

        // Update the rotation to apply the particles velocity vector
        this.weapon.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;

        // If the player hits the attack button and the weapon system isn't running, restart the system and fire!
        if (Input.isPressed(HW4Controls.ATTACK) && !this.weapon.isSystemRunning()) {
            // Update the rotation to apply the particles velocity vector
            this.weapon.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.weapon.startSystem(500, 0, this.owner.position);
        }

        /*
            This if-statement will place a tile wherever the user clicks on the screen. I have
            left this here to make traversing the map a little easier, incase you accidently
            destroy everything with the player's weapon.
        */
        if (Input.isMousePressed()) {
            this.tilemap.setTileAtRowCol(this.tilemap.getColRowAt(Input.getGlobalMousePosition()),5);
        }

	}

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get maxHealth(): number { return this._maxHealth; }
    public set maxHealth(maxHealth: number) { this._maxHealth = maxHealth; }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        this.emitter.fireEvent(HW4Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});

        if (this.health === 0) {
            this.changeState(PlayerStates.DEAD);
        }
    }
}