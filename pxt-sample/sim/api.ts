/// <reference path="../libs/core/enums.d.ts"/>

namespace pxsim.robot {
    /**
     * Turns the direction of robot
     * @param direction the direction to turn, eg: Direction.Left
     */
    //% weight=85
    //% blockId=sampleTurn block="turn %direction|by %angle degrees"
    //% angle.min=-180 angle.max=180
    export function turn(direction: Direction) {}

    /**
     * Moves the robot forward
     * @param steps number of steps to move, eg: 1
     */
    //% weight=90
    //% blockId=sampleForward block="forward %steps"
    export function move() {}

    /**
     * Triggers when the turtle bumps a wall
     * @param handler 
     */
    //% blockId=onBump block="on bump"
    export function wallAhead(handler: RefAction) {}
}


namespace pxsim.loops {

    /**
     * Repeats the code forever in the background. On each iteration, allows other code to run.
     * @param body the code to repeat
     */
    //% help=functions/forever weight=55 blockGap=8
    //% blockId=device_forever block="forever" 
    export function forever(body: RefAction): void {
        thread.forever(body)
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=functions/pause weight=54
    //% block="pause (ms) %pause" blockId=device_pause
    export function pauseAsync(ms: number) {
        return Promise.delay(ms)
    }
}

function logMsg(m:string) { console.log(m) }

namespace pxsim.console {
    /**
     * Print out message
     */
    //% 
    export function log(msg:string) {
        logMsg("CONSOLE: " + msg)
        // why doesn't that work?
        board().writeSerial(msg + "\n")
    }
}