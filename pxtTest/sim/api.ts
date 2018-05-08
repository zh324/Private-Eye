/// <reference path="../libs/core/enums.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace pxsim.Robot {

    /**
     * Makes the robot turn left.
     */
    //% blockId=turnLeft block="turn left"
    export function turnLeftAsync() {
        // Move the robot forward
        board().turnLeft();
        return Promise.delay(100)
    }

    /**
     * Makes the robot turn right.
     */
    //% blockId=turnRight block="turn right"
    export function turnRightAsync() {
        // Move the robot forward
        board().turnRight();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face up.
     */
    //% blockId=faceUp block="face North"
    export function faceUpAsync() {
        // Move the robot forward
        board().faceUp();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face down.
     */
    //% blockId=faceDown block="face South"
    export function faceDownAsync() {
        board().faceDown();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face left.
     */
    //% blockId=faceLeft block="face West"
    export function faceLeftAsync() {
        board().faceLeft();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face right.
     */
    //% blockId=faceRight block="face East"
    export function faceRightAsync() {
        board().faceRight();
        return Promise.delay(100)
    }

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=wallAhead block="wall ahead"
    export function wallAhead() {
        return board().wallAhead();
    }

    /**
     * Judges whether there is a wall ahead.
     */
    //% blockId=moveForward block="walk forward"
    export function moveForwardAsync() {
        board().moveForward();
        return Promise.delay(100)
    }

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=doSomething block="Breath First Search"
    export function BreathFirstSearch() {
        board().triggerBFS();
    }
}

// namespace pxsim.loops {
//     /**
//      * Repeats the code forever in the background. On each iteration, allows other code to run.
//      * @param body the code to repeat
//      */
//     //% help=functions/forever weight=55 blockGap=8
//     //% blockId=device_forever block="forever" 
//     export function forever(body: RefAction): void {
//         thread.forever(body)
//     }

//     /**
//      * Pause for the specified time in milliseconds
//      * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
//      */
//     //% help=functions/pause weight=54
//     //% block="pause (ms) %pause" blockId=device_pause
//     export function pauseAsync(ms: number) {
//         return Promise.delay(ms)
//     }
// }
