/**
 * A set of events for HW4
 */
export enum HW4Events {
    // An event that tells the HW4 level to start. Has data: {}
    LEVEL_START = "LEVEL_START",
    // An event that tells the HW4 level to end. Has data: {}
    LEVEL_END = "LEVEL_END",

    // An event triggered when the player enters an area designated as a "level end" location. Had data: {}
    PLAYER_ENTERED_LEVEL_END = "PLAYER_ENTERED_LEVEL_END",

    // The event sent when a particle hits a tile in the destructible tilemap layer
    PARTICLE_HIT_DESTRUCTIBLE = "PARTICLE_HIT_DESTRUCTIBLE",
}
