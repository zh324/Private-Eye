

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
            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.load.spritesheet("robot", "assets/robot.png", 80, 111, 28);
            this.game.load.image("tiles","assets/tiles.png");

            var mapPath = "maps/map"+this.level+".json";
            this.game.load.tilemap("map",mapPath,null,Phaser.Tilemap.TILED_JSON);

        }

        create() {
            // new added
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.world.enableBody = true;
            this.game.physics.arcade.gravity.y = 0;

            this.keyCount = [0, 0, 0, 0];
            this.need = this.keyCount[this.level - 1];
            this.collected = 0;

            this.robotSize = 0.5;

            this.map = this.game.add.tilemap("map");
            this.map.addTilesetImage("tiles");
    
            this.layer = this.map.createLayer("Tile Layer 1");
            this.layer.resizeWorld();
            this.map.setCollisionBetween(0,1,1);
    
            this.robot = this.game.add.sprite(225, 425, "robot");
            this.robot.animations.add("idle", [0,1,2,3,4,5,6,7,8,9],12,true);
            this.robot.animations.add("walk", [10,11,12,13,14,15,16,17],12,true);
            this.robot.animations.add("jump", [18,19,20,21,22,23,24,25],12,false);
            this.robot.scale.x = this.robotSize;
            this.robot.scale.y = this.robotSize;
    
            this.robot.animations.play("idle");
            this.robot.anchor.set(0.5,0.5);
            this.game.physics.arcade.enable(this.robot);
            this.robot.body.allowGravity = false;
            //this.robot.body.gravity.y = 100;
            //this.robot.body.bounce.set(0.25);
            this.robot.body.collideWorldBounds = true;
            
            this.game.camera.follow(this.robot);
            //cursors = game.input.keyboard.createCursorKeys();
            this.map.setTileIndexCallback(3, this.reachedGoal, this);

            //  The score
            this.scoreText = this.game.add.text(16, 16, 'score: 0', { fontSize: 32, fill: '#000' });

            //  Our controls.
            this.cursors = this.game.input.keyboard.createCursorKeys();

        }



        update() {

            // new added
            this.game.physics.arcade.collide(this.robot, this.layer);
    
            this.robot.body.velocity.x = 0;
            this.robot.body.velocity.y = 0;
    
            if (this.cursors.left.isDown){
                this.robot.body.velocity.x = -250;
                //this.robot.body.velocity.x = -250;
            }
            else if (this.cursors.right.isDown){
                this.robot.body.velocity.x = 250;
                //this.robot.body.velocity.x = 250;
            }
    
            if (this.robot.body.velocity.x >=0){
                this.robot.scale.x = this.robotSize;
            }
            else{
                this.robot.scale.x = -this.robotSize;
            }
    
    
            if (this.cursors.up.isDown){
                this.robot.body.velocity.y = -250;
            }
    
            if (this.cursors.down.isDown){
                
                this.robot.body.velocity.y = 250;
            }
    
    
            if (Math.abs(this.robot.body.velocity.x)>50 || Math.abs(this.robot.body.velocity.y)>50){
                this.robot.animations.play("walk");
            }
            else{
                this.robot.animations.play("idle");
            }
        }

        moveDown() {
            this.robot.body.y += 50;
        }


    


        kill() {
            super.kill();
            if (this.game) {
                this.game.destroy();
                this.game = undefined;
            }
        }


        // new added
        reachedGoal(sprite: Phaser.Sprite, tile: Phaser.Tile){
            if (this.collected == this.need){
                this.level++;
                this.game.state.start("Board");
            
            }
        }

        gotKey(sprite: Phaser.Sprite, tile: Phaser.Tile){
            this.map.removeTile(tile.x, tile.y, this.layer);
            this.collected++;
        }
    }
}