# Homework 3 - CSE 380 - Spring 2023
- Peter Walsh - peter.t.walsh@stonybrook.edu
- Professor Richard McKenna - richard@cs.stonybrook.edu
### Due Date: Friday, March 3, 2023

## Introduction
> First of all, massive shoutout to my friend Andrew Ojeda for making the :fire: level music for this assignment :heart_eyes:. The pacing of the gameplay doesn't quite match the music yet, but I'm going to fix that hopefully soon.

In this assignment, you will make a simple platformer game using the Typescript programming language and the Wolfie2D game engine. By completing this assignment, you should start to become familiar with the Wolfie2D game engine and develop an understanding of:

* How to load tilemaps and tilesets into Wolfie2D
* How to work with Wolfie2Ds physics system
  * Adding physics to game nodes
  * Creating collision groups and triggers
  * Add collidable layers to tilemaps
  * Apply collision groups to tilemaps
* How to play sounds and level music in Wolfie2D
* How to create simple AI using finite state machines
* Resource management 

## Part 1 - Sound Effects and Level Music

## Part 2 - Physics
In the first homework assignment, all of the physics, movement, and collision detection was done manually in the custom scene class. For this assignment, we'll be adding a physics component to all of our game nodes and using the Wolfie2D's physics system to move our game nodes. If you want to move a game node using Wolfie2D's physics system, you have to use the `Physical.move()` method on the game node.
```typescript
interface Physical {
    /**
     * Tells the physics engine to handle a move by this object.
     * @param velocity The velocity with which to move the object.
     */
    move(velocity: Vec2): void;
}
```
A word of caution; Calling the `move()` method and updating the position field of a game node are **NOT** the same thing :scream: 

Moving a game node by updating it's position field is the equivalent of "teleporting" that game node, whereas calling the the `move()` method is how you actually "move" the node. If your game is using physics, you should be calling the move method.

> A lot of the methods and functionality you'll have to use to complete this assignment are defined in Wolfie2Ds `Physical` interface. I recommend taking a look at the methods and documentation in that interface :wink:

## Part 2.1 - Adding Physics to GameNodes
For this assignment, you'll need to make sure all of your nodes have physical components and are registered with the physics system. This includes:

- The player's sprite
- All of the particles in the player's weapon particle system
- The sprite for the player's weapon
- The ground and destructible layers of the tilemap

In Wolfie2D, if you want to add a physics component to your game node, you can call the `Physical.addPhysics()` method on the game node. The method has several optional parameters you can pass to it. 

```typescript
/**
 * Adds physics to this object
 * @param collisionShape The shape of this collider for this object
 * @param isCollidable Whether this object will be able to collide with other objects
 * @param isStatic Whether this object will be static or not
 */
addPhysics(collisionShape?: Shape, colliderOffset?: Vec2, isCollidable?: boolean, isStatic?: boolean): void;
```

## Part 2.2 - Creating Physics Groups and Triggers
For this homework assignment, you'll have to configure the physics groups and collision map for the scene. There are five collision groups that need to be accounted for:
1. Ground: the group for thhe indestructible layer of the tilemap
2. Player: the group for the player
3. Weapon: the group for the particles in the player's weapon system
4. Destructible: the group for destructible layer of the tilemap

The collision map for the five groups should resemble the table shown below:

|              | Ground | Player | Weapon | Destructible |
|--------------|--------|--------|--------|--------------|
| Ground       | No     | Yes    | Yes    | No           | 
| Player       | Yes    | No     | No     | Yes          |
| Weapon       | Yes    | No     | No     | Yes          | 
| Destructible | No     | Yes    | Yes    | No           | 

Currently, the way you have to configure physics groups and triggers is by passing in physics groups is through the scene options that get passed to the scene constructor. 
```typescript
// Here's a constructor for a custom scene class extending the base scene class
public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {

    // Pass the physics groups into the super class constructor via the scene options parameter
    super(viewport, sceneManager, renderingManager, {...options, physics: { /* Physics groups/data here */ }});
    
}
```
The `physics` object that can be passed into the scene options has the following format:
```typescript
type PhysicOptions = {

  // The names of the collision groups to add to the physics manager for this scene
  groupNames: string[];
  
  // The collision map for the different collision groups
  collisions: number[][];
  
}
```
Each group in `groupNames` will get a row/column in the collision map. 

## Part 2.3 - Assigning Physics Groups and Triggers
For this assignment you'll need to assign different types of game nodes to different collision groups.

* The player should be assigned to the Player physics group
* All particles in the particle pool for the player's particle weapon should be assigned to the Weapon physics group

Physics groups can be assigned to game nodes using the `Physical.setGroup()` method. 

```typescript
interface Physical {
    /**
     * Sets the physics group of this node
     * @param group The name of the group
     */
    setGroup(group: string): void;
}
```

In addition, you'll most likely want to set events to be fired when collisions occur between the objects in the different physics groups. You can assign collision triggers to nodes using the `Physical.setTrigger()` method. 

```typescript 
interface Physical {
    /**
     * Sets this object to be a trigger for a specific group
     * @param group The name of the group that activates the trigger
     * @param onEnter The name of the event to send when this trigger is activated
     * @param onExit The name of the event to send when this trigger stops being activated
     */
    setTrigger(group: string, onEnter: string, onExit: string): void;
}
```

When the physics system detects a collision between a game node and one of it's trigger groups, an event will be fired to the EventQueue with the name of the event passed to the `onEnter` field of the `setTrigger()` method and the following data:

```typescript
type TriggerEventData = {

  // The id of the node in the collision with a trigger event
  node: number
  
  // The id of the other node in the collision
  other: number
  
}
```

## Part 3 - Particle Systems
In this homework assignment, you will have to work with an extension of Wolfie2Ds particle system. The particle system used in this assignment is located in the `PlayerWeapon.ts` file. The `PlayerWeapon` extends the base `ParticeSystem` class and looks similar to the code shown below.

```typescript
/**
 * The particle system used for the player's weapon
 */
export default class PlayerWeapon extends ParticleSystem {

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Implementation not shown
    }

}
```
For this part of the assignment, you'll need to adapt the `PlayerWeapon` particle system to support some additional functionality. You may add any additional fields and methods you need to the `PlayerWeapon` class to get things working. 
> Before you go adding functionaility to the custom PlayerWeapon particle system, I recommend seeing what fields and/or methods you could possibly override and/or expose from the base ParticleSystem class.

### Part 3.1 - Rotating the particles
Currently, the particle effect triggered by the player's attack always fires to the right, similar to the image shown below.

<p align="center">
<img width="696" alt="Screen Shot 2023-02-08 at 12 06 13 AM" src="https://user-images.githubusercontent.com/63989572/217439115-ff5e8761-139c-4cbc-b6ba-2037025a5b33.png">
</p>

You need to adapt the particle system, so that the particles are fired in the direction of the position the mouse was at when the attack button was pressed (similar to the image shown below). The particles should not follow the mouse around the screen.

<p align="center">
<img width="622" alt="Screen Shot 2023-02-08 at 12 01 31 AM" src="https://user-images.githubusercontent.com/63989572/217438081-30f156bb-55e5-4af5-b6b3-71e43f2a54ac.png">
</p>

## Part 4 - Tweening
Creating and playing tweens in Wolfie2D. Probably the flip and level end slide in animation.

## Part 5 - Playing Sound
Firing events to the audio manager in Wolfie2d. Start, stop, playing sounds on a loop for music.

## Part 6 - Resource Management
Unloading and loading resources into the game (different tilemaps, custom sounds/music, custom sprites)


