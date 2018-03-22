/// <reference path="../libs/core/enums.d.ts"/>

namespace pxsim.player {
    /**
     * Sets the velocity of the player
     * @param dimension x or y
     * @param value new velocity
     */
    //% blockId=phasersetvelocity block="set player velocity %dimension to %value"
    export function setVelocity(dimension: Dimension, value: number) {
        //  Reset the players velocity (movement)
        switch (dimension) {
            case Dimension.X:
                board().robot.body.velocity.x = value;
                break;
            case Dimension.Y:
                board().robot.body.velocity.y = value;
                break;
        }
    }

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
    export function playAnimation(animation: Animation) {
        const b = board();
        switch(animation) {
            case Animation.Left: b.robot.animations.play('left'); break;
            case Animation.Right: b.robot.animations.play('right'); break;
        }
    }

    /**
     * Moves the sprite forward
     * @param steps number of steps to move, eg: 1
     */
    //% weight=90
    //% blockId=sampleForward block="forward %steps"
    export function forwardAsync(steps: number) {
        return board().robot.body.velocity.y = 250 * steps;
    }

    /**
     * Moves the sprite forward
     * @param direction the direction to turn, eg: Direction.Left
     * @param angle degrees to turn, eg:90
     */
    //% weight=85
    //% blockId=sampleTurn block="turn %direction|by %angle degrees"
    //% angle.min=-180 angle.max=180
    export function turnAsync(direction: Direction, angle: number) {
        let b = board();

        if (direction == Direction.Left)
            b.robot.angle -= angle;
        else
            b.robot.angle += angle;
        return Promise.delay(400)
    }

    /**
     * Triggers when the robot bumps a wall
     * @param handler 
     */
    //% blockId=onBump block="on bump"
    export function onBump(handler: RefAction) {
        let b = board();

        b.bus.listen("Robot", "Bump", handler);
    }
}

namespace pxsim.cursors {
    /**
     * Queries is a cursor is down
     * @param cursor 
     */
    //% blockId=phasercursorsisdown block="is %cursor down"
    export function isDown(cursor: Cursor): boolean {
        const cursors = board().cursors;
        switch (cursor) {
            case Cursor.Left: return cursors.left.isDown;
            case Cursor.Right: return cursors.right.isDown;
            case Cursor.Up: return cursors.right.isUp;
            case Cursor.Down: return cursors.down.isDown;
            default: return false;
        }
    }
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

name 