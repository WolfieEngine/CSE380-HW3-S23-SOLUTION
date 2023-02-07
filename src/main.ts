import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./hw4/Scenes/MainMenu";
import { HW4Controls } from "./hw4/HW4Controls";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1200, y: 800},          // The size of the game
        clearColor: {r: 34, g: 32, b: 52},   // The color the game clears to
        inputs: [
            {name: HW4Controls.MOVE_LEFT, keys: ["a"]},
            {name: HW4Controls.MOVE_RIGHT, keys: ["d"]},
            {name: HW4Controls.JUMP, keys: ["w", "space"]},
            {name: HW4Controls.ATTACK, keys: ["x"]}
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(MainMenu, {});
})();

function runTests(){};