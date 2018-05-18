/// <reference path="../libs/core/enums.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace pxsim.Robot {

    /**
     * Moves the robot forward by 1 cell.
     */
    //% blockId=moveForward block="walk forward"
    export function moveForwardAsync() {
        board().moveForward();
        return Promise.delay(100)
    }

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
     * Makes the robot face up north.
     */
    //% blockId=faceUp block="face North"
    export function faceUpAsync() {
        board().faceUp();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face south.
     */
    //% blockId=faceDown block="face South"
    export function faceDownAsync() {
        board().faceDown();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face west.
     */
    //% blockId=faceLeft block="face West"
    export function faceLeftAsync() {
        board().faceLeft();
        return Promise.delay(100)
    }

    /**
     * Makes the robot face east.
     */
    //% blockId=faceRight block="face East"
    export function faceRightAsync() {
        board().faceRight();
        return Promise.delay(100)
    }
}
