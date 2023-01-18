# Homework 3 - CSE 380 - Spring 2023
- Peter Walsh - peter.t.walsh@stonybrook.edu
- Professor Richard McKenna - richard@cs.stonybrook.edu
### Due Date: Friday, March 3, 2023

## Introduction
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

In the first homework assignment, all of the physics, movement, and collision detection was done manually in the custom scene class. For this assignment, we'll be adding a physics component to all of our actors game nodes and registering our nodes with the physics system.

> A lot of the methods and functionality you'll have to use to complete this assignment are defined in Wolfie2Ds `Physical` interface. I recommend taking a look at the methods and documentation in that interface :wink:

## StateMachine AI
In the first homework assignment, we assigned some simple AI classes to our game nodes. In this assignment, we're going to take the AI a step further, with two 

```mermaid
stateDiagram-
```



## Moving Nodes in the Physics System
If you want to move a game node using Wolfie2D's physics system, you should call the `Physical.move()` method on the game node.

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

## Adding Physics to GameNodes
For this assignment, you'll need to make sure all of your nodes have physical components and are registered with the physics system. This includes:

- The player's sprite
- All of the geese sprites
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

## Creating Physics Groups and Triggers
For this homework assignment, you'll have to configure the physics groups and collision map for the scene. There are five collision groups that need to be accounted for:
1. Ground: the group for thhe indestructible layer of the tilemap
2. Player: the group for the player
3. Weapon: the group for the particles in the player's weapon system
4. Destructible: the group for destructible layer of the tilemap
5. Goose: the group for the geese

The collision map for the five groups should resemble the table shown below:

|              | Ground | Player | Weapon | Destructible | Goose |
|--------------|--------|--------|--------|--------------|-------|
| Ground       | No     | Yes    | Yes    | No           | Yes   |
| Player       | Yes    | No     | No     | Yes          | Yes   |
| Weapon       | Yes    | No     | No     | Yes          | No    |
| Destructible | No     | Yes    | Yes    | No           | Yes   |
| Goose        | Yes    | Yes    | No     | Yes          | No    |

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

## Assigning Physics Groups and Triggers
For this assignment you'll need to assign different types of game nodes to different collision groups.

* The player should be assigned to the Player physics group
* All goose actors in the geese object pool should be assigned the Goose physics group
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

## Tilemap Physics Properties
Wolfie2Ds supports two physics properties for tilemap layers. They are as follows:

| Name       | Type    | Description |
|------------|---------|-------------|
| Collidable | boolean | True if this tilemap layer is collidable                                 |
| Group      | string  | The name of the physics group this tilemap layer should be registered to |


In the tilemaps you create, you should assign the collidable property for both the Ground and Destructible layers to be true and give both layers a physics group. 

## Particle Systems
In this homework assignment, you will have to work with an extension of Wolfie2Ds particle system. The `PlayerWeapon` extends the base `ParticeSystem` class, sprinkling in some extra bits of functionality, turning the particle system into a weapon.


