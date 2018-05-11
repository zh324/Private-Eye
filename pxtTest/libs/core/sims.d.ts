// Auto-generated from simulator. Do not edit.
declare namespace Robot {
    /**
     * Moves the robot forward by 1 cell.
     */
    //% blockId=moveForward block="walk forward"
    //% shim=Robot::moveForwardAsync promise
    function moveForward(): void;

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
     * Makes the robot face up north.
     */
    //% blockId=faceUp block="face North"
    //% shim=Robot::faceUpAsync promise
    function faceUp(): void;

    /**
     * Makes the robot face south.
     */
    //% blockId=faceDown block="face South"
    //% shim=Robot::faceDownAsync promise
    function faceDown(): void;

    /**
     * Makes the robot face west.
     */
    //% blockId=faceLeft block="face West"
    //% shim=Robot::faceLeftAsync promise
    function faceLeft(): void;

    /**
     * Makes the robot face east.
     */
    //% blockId=faceRight block="face East"
    //% shim=Robot::faceRightAsync promise
    function faceRight(): void;

    /**
     * Returns true if there is wall directly in front of the robot, and false otherwise.
     */
    //% blockId=wallAhead block="wall ahead at level %level"
    //% shim=Robot::wallAhead
    function wallAhead(level: number): boolean;

}

// Auto-generated. Do not edit. Really.
