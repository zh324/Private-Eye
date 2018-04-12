/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />
//
//declare let Phaser: any;


namespace pxsim {

    export interface ISimMessage {
        type: "simulator.message";
        key?: string;
        data?: string;
    }
    /**
     * This function gets called each time the program restarts
     */

    initCurrentRuntime = () => {
        runtime.board = new Board();
    };


    /**
     * Gets the current 'board', eg. program state.
     */
    export function board(): Board {
        return runtime.board as Board;
    }

    const postContainerMessage = (message: pxsim.ISimMessage) => {
        Runtime.postMessage({
            type: "custom",
            __proxy: "parent",
            content: message
        } as pxsim.SimulatorCustomMessage);
    };

    /**
     * Represents the entire state of the executing program.
     * Do not store state anywhere else!
     */
    export class Board extends pxsim.BaseBoard {
        public robot: Phaser.Sprite;
        public bus: EventBus;
        public game: Phaser.Game;
        //public platforms: Phaser.Group;
        //public player: Phaser.Sprite;
        public cursors: Phaser.CursorKeys;
        public score: number = 0;
        public scoreText: Phaser.Text;
        //public stars: Phaser.Group;


        public level = 1;
        public bombCount: any;
        public need: number;
        public collected: number;
        public robotSize: number;
        public map: any;
        public layer: any;
        public keyCount: any;

        public move: Phaser.Tween;

        public flipFlop_l: boolean;
        public flipFlop_r: boolean;
        public flipFlop_u: boolean;
        public flipFlop_d: boolean;

        constructor() {
            super();
            this.bus = new EventBus(runtime);
        }

        initAsync(msg: pxsim.SimulatorRunMessage): Promise<void> {

            postContainerMessage({
                type: "simulator.message",
                key: "init"
            });
            let that = this;
            return new Promise<void>((resolve, reject) => {
                this.game = new Phaser.Game(448, 448, Phaser.AUTO, '', {
                    preload: () => this.preload(),
                    create: () => {this.create(); resolve();},
                    update: () => this.update()
                });
            });
        }


        preload() {
            console.log("Preload");
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.spritesheet("robot", "assets/robot.png", 80, 111, 28);
            this.game.load.image("tiles","assets/tiles.png");
            
            // Load in all maps that we have
            for (var i = 0; i <= 4; i++) {
                //Load just adds a Tile Map data file to the current load queue.
                //It doesn't seem to replace the initial load
                this.game.load.tilemap("map"+i,"maps/map"+i+".json",null,Phaser.Tilemap.TILED_JSON);
            }
        }


        create() {
            console.log("Create");
            
            // Setup game physics
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.world.enableBody = true;
            this.game.physics.arcade.gravity.y = 0;

            // Game elements
            this.keyCount = [0, 0, 0, 0];
            this.need = this.keyCount[this.level - 1];
            this.collected = 0;

            this.createCurrLevel();
        }

        // Creates the map and its associated elements for the current level.
        createCurrLevel() {

            // Write the first map of the game to the game.
            // In this case level is initially 1, so this adds (writes) map1 to the game.
            this.map = this.game.add.tilemap("map" + this.level);

            // Set up tiles for the map above
            this.map.addTilesetImage("tiles");
            this.map.setCollisionBetween(0,1,1);

            // Create a visual layer for the map above.
            // This completely covers up everything from the previous layer.
            this.layer = this.map.createLayer("Tile Layer 1");
            console.log(this.map.currentLayer);
            this.layer.resizeWorld();

            // Player robot stuff
            this.robotSize = 0.5;
            this.robot = this.game.add.sprite(228, 425, "robot");
            this.robot.animations.add("idle", [0,1,2,3,4,5,6,7,8,9],12,true);
            this.robot.animations.add("walk", [10,11,12,13,14,15,16,17],12,true);
            this.robot.animations.add("jump", [18,19,20,21,22,23,24,25],12,false);
            this.robot.scale.x = this.robotSize;
            this.robot.scale.y = this.robotSize;
            this.robot.animations.play("idle");
            this.robot.anchor.set(0.5,0.5);
            this.game.physics.arcade.enable(this.robot);
            this.robot.body.allowGravity = false;
            this.robot.body.collideWorldBounds = true;
            
            // Setup game camera
            this.game.camera.follow(this.robot);

            // Setup the score
            this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: 32, fill: '#000' });

            // Setup winning condition
            this.map.setTileIndexCallback(3, this.reachedGoal, this);

            // Setup our controls
            this.cursors = this.game.input.keyboard.createCursorKeys();
        }



        update() {
            // new added
            this.game.physics.arcade.collide(this.robot, this.layer);
            //this.robot.body.moving = false;

            this.robot.body.velocity.x = 0;
            this.robot.body.velocity.y = 0;
            
            if (this.cursors.left.isDown && this.cursors.right.isUp){
                if (!this.flipFlop_l){
                    this.moveLeft();
                    this.flipFlop_l = true;
                }
            }
            else if (this.cursors.left.isUp){
                this.flipFlop_l = false;
            }

            
            if (this.cursors.right.isDown && this.cursors.left.isUp){
                if (!this.flipFlop_r){
                    this.moveRight();
                    this.flipFlop_r = true;
                }
            }
            else if (this.cursors.right.isUp){
                this.flipFlop_r = false;
            }
            
            
            if (this.cursors.left.isDown){
                this.robot.scale.x = -this.robotSize;
            }
            else if (this.cursors.right.isDown){
                this.robot.scale.x = this.robotSize;
            }
            
            
    
            
            if (this.cursors.up.isDown && this.cursors.down.isUp){
                if (!this.flipFlop_u){
                    this.moveUp();
                    this.flipFlop_u = true;
                }
            }
            else if (this.cursors.up.isUp){
                this.flipFlop_u = false;
            }
          
            if (this.cursors.down.isDown && this.cursors.up.isUp){
                if (!this.flipFlop_d){
                    this.moveDown();
                    this.flipFlop_d = true;
                }
            }
            else if (this.cursors.down.isUp){
                this.flipFlop_d = false;
            }
            

            
        }

        // new added
        reachedGoal(sprite: Phaser.Sprite, tile: Phaser.Tile){
            if (this.collected == this.need){
                // Increment level
                this.level++;
                this.createCurrLevel();
            }
        }

        gotKey(sprite: Phaser.Sprite, tile: Phaser.Tile){
            this.map.removeTile(tile.x, tile.y, this.layer);
            this.collected++;
        }


        kill() {
            super.kill();
            if (this.game) {
                this.game.destroy();
                this.game = undefined;
            }
        }

        moveLeft() {
            var marker_X = Phaser.Math.snapToFloor(Math.floor(this.robot.x), 64) / 64;
            var marker_Y = Phaser.Math.snapToFloor(Math.floor(this.robot.y), 64) / 64;
            var i = this.map.getLayer();
            var tile_left = this.map.getTileLeft(i, marker_X, marker_Y);
            var left = this.game.add.tween(this.robot);
            this.robot.scale.x = -this.robotSize;
            if (tile_left.index != 1){
                this.robot.animations.play("walk");
                left.to({ x: '-64' }, 500, Phaser.Easing.Linear.None, true)
                left.onComplete.add(function() {  
                    this.robot.animations.play("idle");
                    // Set robotMoving back to false so that the next movement can start.
                }, this)
                left.start();
                //this.robot.body.velocity.x = -250;
            }
        }

        moveRight() {
            var marker_X = Phaser.Math.snapToFloor(Math.floor(this.robot.x), 64) / 64;
            var marker_Y = Phaser.Math.snapToFloor(Math.floor(this.robot.y), 64) / 64;
            var i = this.map.getLayer();
            var tile_right = this.map.getTileRight(i, marker_X, marker_Y);
            var right = this.game.add.tween(this.robot);
            this.robot.scale.x = this.robotSize;
            if (tile_right.index != 1){
                this.robot.animations.play("walk");
                right.to({ x: '64' }, 500, Phaser.Easing.Linear.None, true)
                right.onComplete.add(function() {  
                    this.robot.animations.play("idle");
                    // Set robotMoving back to false so that the next movement can start.
                }, this)
                right.start();
                //this.robot.body.velocity.x = -250;
            }
        }

        moveUp() {
            var marker_X = Phaser.Math.snapToFloor(Math.floor(this.robot.x), 64) / 64;
            var marker_Y = Phaser.Math.snapToFloor(Math.floor(this.robot.y), 64) / 64;
            var i = this.map.getLayer();
            var tile_above = this.map.getTileAbove(i, marker_X, marker_Y);
            var up = this.game.add.tween(this.robot);
            if (tile_above.index != 1){
                this.robot.animations.play("walk");
                up.to({ y: '-64' }, 500, Phaser.Easing.Linear.None, true)
                up.onComplete.add(function() {  
                    this.robot.animations.play("idle");
                    // Set robotMoving back to false so that the next movement can start.
                }, this)
                up.start();
                //this.robot.body.velocity.x = -250;
            }
        }

        moveDown() {
            var marker_X = Phaser.Math.snapToFloor(Math.floor(this.robot.x), 64) / 64;
            var marker_Y = Phaser.Math.snapToFloor(Math.floor(this.robot.y), 64) / 64;
            var i = this.map.getLayer();
            var tile_below = this.map.getTileBelow(i, marker_X, marker_Y);
            var down = this.game.add.tween(this.robot);
            if (tile_below.index != 1){
                this.robot.animations.play("walk");
                down.to({ y: '64' }, 500, Phaser.Easing.Linear.None, true)
                down.onComplete.add(function() {  
                    this.robot.animations.play("idle");
                    // Set robotMoving back to false so that the next movement can start.
                }, this)
                down.start();
                //this.robot.body.velocity.x = -250;
            }
        }


    }
}
