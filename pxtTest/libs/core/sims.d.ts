// Auto-generated from simulator. Do not edit.
declare namespace Robot {
    /**
     * Makes the robot turn left.
     */
    //% blockId=turnLeft block="turn left"
    //% shim=Robot::turnLeftAsync promise
    function turnLeft(): void;

    /**
     * Makes the robot turn right.
     */
    //% blockId=turnRight block="turn right"
    //% shim=Robot::turnRightAsync promise
    function turnRight(): void;

    /**
     * Makes the robot face up.
     */
    //% blockId=faceUp block="face North"
    //% shim=Robot::faceUpAsync promise
    function faceUp(): void;

    /**
     * Makes the robot face down.
     */
    //% blockId=faceDown block="face South"
    //% shim=Robot::faceDownAsync promise
    function faceDown(): void;

    /**
     * Makes the robot face left.
     */
    //% blockId=faceLeft block="face West"
    //% shim=Robot::faceLeftAsync promise
    function faceLeft(): void;

    /**
     * Makes the robot face right.
     */
    //% blockId=faceRight block="face East"
    //% shim=Robot::faceRightAsync promise
    function faceRight(): void;

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=wallAhead block="wall ahead"
    //% shim=Robot::wallAhead
    function wallAhead(): boolean;

    /**
     * Judges whether there is a wall ahead.
     */
    //% blockId=moveForward block="walk forward"
    //% shim=Robot::moveForwardAsync promise
    function moveForward(): void;

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=doSomething block="Breath First Search"
    //% shim=Robot::BreathFirstSearch
    function BreathFirstSearch(): void;

}

// Auto-generated. Do not edit. Really.
