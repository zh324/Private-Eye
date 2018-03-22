/// <reference path="../libs/core/enums.d.ts"/>
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

namespace pxsim.Robot {
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
     * Move the robot forward
     */
    //% blockId=moveForward block="move"
    export function move() {
        // Move the robot forward
        board().robot.body.velocity.x = 250;
        //board().robot.body.y += 50;
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