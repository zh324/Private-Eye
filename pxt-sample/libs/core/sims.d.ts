// Auto-generated from simulator. Do not edit.
declare namespace robot {
    /**
     * Turns the direction of robot
     * @param direction the direction to turn, eg: Direction.Left
     */
    //% weight=85
    //% blockId=sampleTurn block="turn %direction|by %angle degrees"
    //% angle.min=-180 angle.max=180
    //% shim=robot::turn
    function turn(direction: Direction): void;

    /**
     * Moves the robot forward
     * @param steps number of steps to move, eg: 1
     */
    //% weight=90
    //% blockId=sampleForward block="forward %steps"
    //% shim=robot::move
    function move(): void;

    /**
     * Triggers when the turtle bumps a wall
     * @param handler 
     */
    //% blockId=onBump block="on bump"
    //% shim=robot::wallAhead
    function wallAhead(handler: () => void): void;

}
declare namespace loops {
    /**
     * Repeats the code forever in the background. On each iteration, allows other code to run.
     * @param body the code to repeat
     */
    //% help=functions/forever weight=55 blockGap=8
    //% blockId=device_forever block="forever"
    //% shim=loops::forever
    function forever(body: () => void): void;

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=functions/pause weight=54
    //% block="pause (ms) %pause" blockId=device_pause
    //% shim=loops::pauseAsync promise
    function pause(ms: number): void;

}
declare namespace console {
    /**
     * Print out message
     */
    //%
    //% shim=console::log
    function log(msg: string): void;

}

// Auto-generated. Do not edit. Really.
