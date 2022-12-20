/**
 * An enum with keys and paths to sounds for HW4.
 */
export enum HW4Sounds {
    // The music for the levels
    LEVEL_MUSIC_KEY = "LEVEL_MUSIC",
    LEVEL_MUSIC_PATH = "hw4_assets/music/hw5bg.mp3",

    // The music for the menu
    MENU_MUSIC_KEY = "MENU_MUSIC",
    MENU_MUSIC_PATH = "hw4_assets/music/menu.mp3",

    // The player's death audio
    DEATH_AUDIO_KEY = "PLAYER_DEATH",
    DEATH_AUDIO_PATH = "hw4_assets/sounds/player_death.wav",

    // The player's jump audio
    JUMP_AUDIO_KEY = "PLAYER_JUMP",
    JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav",

    // The hit sound effect for the geese
    HIT_AUDIO_KEY = "ENEMY_HIT",
    HIT_AUDIO_PATH = "hw4_assets/sounds/goose_hit.wav",

    // The sound to play when a tile is destroyed
    TILE_DESTROYED_KEY = "TILE_DESTROYED",
    TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav"
}

/**
 * An enum with keys and paths to sprites in HW4 (just the player weapon sprite)
 */
export enum HW4Sprites {
    // Players weapon sprite
    WEAPON_KEY = "WEAPON",
    WEAPON_PATH = "hw4_assets/sprites/Cannon.png"
}

/**
 * An enum with keys associated with the player spritesheet.
 */
export enum HW4PlayerSpritesheet {
    // A key for the player spritesheet and the path to the spritesheet data
    KEY = "PLAYER",
    PATH = "hw4_assets/spritesheets/Peter.json",

    // Animation keys for the player spritesheet
    IDLE = "IDLE",
    WALK = "WALK",
    JUMP = "JUMP",
}

export enum HW4GooseSpritesheet {
    // Goose spritesheet key and data
    KEY = "GOOSE",
    PATH = "hw4_assets/spritesheets/goose.json",

    // Animation keys for the goose spritesheet
}

/** 
 * Keys for the HW4Level1 tilemap.
 */ 
export enum HW4Level1Tilemap {
    // The key for the tilemap data in the ResourceManager.
    KEY = "LEVEL1",
    // The path to the tilemap data
    PATH = "hw4_assets/tilemaps/HW4Level1.json",
    /*
        Keys for the different layers of the HW4Level1 tilemap. The layer keys should
        be the same as the names of the layers in the HW4Level1.json file.
    */
    BACKGROUND = "Background",
    MAIN = "Main",
    DESTRUCTIBLE = "Destructable"
}

/** 
 * Keys for the HW4Level2 tilemap.
 */ 
export enum HW4Level2Tilemap {
    // The key for the tilemap data in the ResourceManager.
    KEY = "LEVEL2",
    // The path to the tilemap data
    PATH = "hw4_assets/tilemaps/HW4Level2.json",
    /*
        Keys for the different layers of the level2 tilemap. The layer keys should
        be the same as the names of the layers in the HW4Level2.json file.
    */
    BACKGROUND = "Background",
    MAIN = "Main",
    DESTRUCTIBLE = "Destructable"
}