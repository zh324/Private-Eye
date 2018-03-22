// Auto-generated from simulator. Do not edit.
declare namespace player {
    /**
     * Sets the velocity of the player
     * @param dimension x or y
     * @param value new velocity
     */
    //% blockId=phasersetvelocity block="set player velocity %dimension to %value"
    //% shim=player::setVelocity
    function setVelocity(dimension: Dimension, value: number): void;

    /** 
     * Checks if the player is hitting the platforms
     */
    //% blockId=phaserhitplatform block="is player hitting platforms"
    /*export function isHittingPlatforms(): boolean {
    const b = board();
    const hitPlatform = b.game.physics.arcade.collide(b.robot, b.platforms);
    return hitPlatform;
    }*/
    /**
     * Plays an animation on the player
     * @param animation 
     */
    //% blockId=phaserplayanimation block="player play animation %animation"
    //% shim=player::playAnimation
    function playAnimation(animation: Animation): void;

    /**
     * Moves the sprite forward
     * @param steps number of steps to move, eg: 1
     */
    //% weight=90
    //% blockId=sampleForward block="forward %steps"
    //% shim=player::forwardAsync promise
    function forward(steps: number): void;

    /**
     * Moves the sprite forward
     * @param direction the direction to turn, eg: Direction.Left
     * @param angle degrees to turn, eg:90
     */
    //% weight=85
    //% blockId=sampleTurn block="turn %direction|by %angle degrees"
    //% angle.min=-180 angle.max=180
    //% shim=player::turnAsync promise
    function turn(direction: Direction, angle: number): void;

    /**
     * Triggers when the robot bumps a wall
     * @param handler 
     */
    //% blockId=onBump block="on bump"
    //% shim=player::onBump
    function onBump(handler: () => void): void;

}
declare namespace cursors {
    /**
     * Queries is a cursor is down
     * @param cursor 
     */
    //% blockId=phasercursorsisdown block="is %cursor down"
    //% shim=cursors::isDown
    function isDown(cursor: Cursor): boolean;

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

// Auto-generated. Do not edit. Really.
