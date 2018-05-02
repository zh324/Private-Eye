// Auto-generated from simulator. Do not edit.
declare namespace Robot {
    /**
     * Makes the robot face up.
     */
    //% blockId=faceUp block="face up"
    //% shim=Robot::faceUpAsync promise
    function faceUp(): void;

    /**
     * Makes the robot face down.
     */
    //% blockId=faceDown block="face down"
    //% shim=Robot::faceDownAsync promise
    function faceDown(): void;

    /**
     * Makes the robot face left.
     */
    //% blockId=faceLeft block="face left"
    //% shim=Robot::faceLeftAsync promise
    function faceLeft(): void;

    /**
     * Makes the robot face right.
     */
    //% blockId=faceRight block="face right"
    //% shim=Robot::faceRightAsync promise
    function faceRight(): void;

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=wallAhead block="walk ahead"
    //% shim=Robot::wallAheadAsync promise
    function wallAhead(): void;

    /**
     * Judges whether there is a wall ahead.
     */
    //% blockId=moveForward block="walk forward"
    //% shim=Robot::moveForwardAsync promise
    function moveForward(): void;

    /**
     * Moves the robot 1 step in the direction it is facing.
     */
    //% blockId=doSomething block="do something"
    //% shim=Robot::doSomething
    function doSomething(): void;

}

// Auto-generated. Do not edit. Really.
