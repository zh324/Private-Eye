/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>

declare let Phaser: any;

namespace pxsim {
    /**
     * This function gets called each time the program restarts
     */
    initCurrentRuntime = () => {
        runtime.board = new Board();
    };

    /**
     * Gets the current 'board', eg. program state.
     */
    export function board() : Board {
        return runtime.board as Board;
    }

    /**
     * Represents the entire state of the executing program.
     * Do not store state anywhere else!
     */
    export class Board extends pxsim.BaseBoard {
        private game: any;
        private gameLoaded: boolean;
        private robot: any;
        private map: any;
        private cursors: any;
        private layer: any;

        constructor() {
            super();
            //initialize phaser
            this.initPhaser();
        }

        initPhaser() {
            if (screen.width > 1500) {
                this.game = new Phaser.Game(640,480,Phaser.AUTO,"ph_game");
            } else {
                const fullHeight = window.innerHeight;
                const fullWidth = window.innerWidth;
                this.game = new Phaser.Game(fullHeight, fullWidth, Phaser.AUTO, "ph_game");
            }
        }

        getGame() {
            return this.game;
        }

        preload() {
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+\//.test(window.location.href);
            const staticPath = isLocalhost ? '../static' : './docs/static';
            this.game.load.spritesheet("robot", `${staticPath}/images/robot.png`, 80, 111, 28);
            this.game.load.image("tiles",`${staticPath}/images/tiles.png`);
            this.game.load.tilemap("map","../map1/maps/test.json",null,Phaser.Tilemap.TILED_JSON);
        }

        create() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            // load map
            this.map = this.game.add.tilemap("map");
            this.map.addTilesetImage("tiles");
    
            this.layer = this.map.createLayer("Tile Layer 1");
            this.layer.resizeWorld();
            this.map.setCollisionBetween(0,24);
    
            this.robot = this.game.add.sprite(150, 150, "robot");
            this.robot.animations.add("idle", [0,1,2,3,4,5,6,7,8,9],12,true);
            this.robot.animations.add("walk", [10,11,12,13,14,15,16,17],12,true);
            this.robot.animations.add("jump", [18,19,20,21,22,23,24,25],12,false);
    
            this.robot.animations.play("idle");
            this.robot.anchor.set(0.5,0.5);
            this.game.physics.arcade.enable(this.robot);
            this.robot.body.gravity.y = 100;
            this.robot.body.bounce.set(0.25);
            this.robot.body.collideWorldBound = true;
            
            this.game.camera.follow(this.robot);
            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        update() {
            this.game.physics.arcade.collide(this.robot, this.layer);
            if (Math.abs(this.robot.body.velocity.x)>100){
                this.robot.animations.play("walk");
            }
            else{
                this.robot.animations.play("idle");
            }
            if (this.robot.body.velocity.x >0){
                this.robot.scale.x = 1;
            }
            else{
                this.robot.scale.x = -1;
            }
            if (this.cursors.left.isDown){
                this.robot.body.velocity.x = -250;
            }
            if (this.cursors.right.isDown){
                this.robot.body.velocity.x = 250;
            }
        }

    }
}