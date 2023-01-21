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
    PLAYER_KILLED = "PLAYER_KILLED",

    /*
        An event sent by the physics system when a particle from the player's weapon system
        starts to collide with a goose.

        Has data: { node: number, other: number }
    */
    WEAPON_HIT_GOOSE = "WEAPON_HIT_GOOSE",

    /*
        An event sent by the physics system when a goose starts to collide with the player.
        
        Has data: { node: number, other: number }
    */
    GOOSE_HIT_PLAYER = "GOOSE_HIT_PLAYER",

    // An event triggered when a goose dies. Has data: {}
    GOOSE_DIED = "GOOSE_DIED",
}