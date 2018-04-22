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
		
		public stateText: Phaser.Text;

		public cursors: Phaser.CursorKeys;
		public spaceKey: any;
		public fireButton: Phaser.Key;
		public score: number = 0;
		public scoreText: Phaser.Text;
		//public stars: Phaser.Group;

		public move: Phaser.Tween;

		// User's code block
		public startedNewLevel: boolean;

		// Game logic
		public level = 1;
		public bombCount: any;
		public need: number;
		public collected: number;
		
		public map: any;
		public layer: any;
		public keyCount: any;
		public robotStartingX: any;
		public robotStartingY: any;

		public robotX: any; // Tile, not pixel
		public robotY: any; // Tile, not pixel
		public robotDirection: any;

		public stepLimit = 100;

		// Animation
		public actionLog: string[];
		public xHistory: number[];
		public yHistory: number[];
		public tweenChain: Phaser.Tween[];
		public animationSpeed: number;
		public tweenChainRunning: boolean;
		public pauseUpdateFunction: boolean;

		//public currTween: any;

		public flipFlop_l: boolean;
		public flipFlop_r: boolean;
		public flipFlop_u: boolean;
		public flipFlop_d: boolean;
		public flipFlop_move: boolean;
		public bulletTime: number;
		public robotSize: number;


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
			this.game.load.spritesheet("robot", "assets/images/GirlSprite.png", 64, 64, 16);
			this.game.load.image("tiles","assets/images/tiles.png");
			
			// Load in all maps that we have
			for (var i = 0; i <= 4; i++) {
				//Load just adds a Tile Map data file to the current load queue.
				//It doesn't seem to replace the initial load
				this.game.load.tilemap("map"+i,"maps/map"+i+".json",null,Phaser.Tilemap.TILED_JSON);
			}
		}

		// Create initial variables of the game.
		// Called once at start of game load.
		create() {
			console.log("Create");
			
			// Setup game physics
			this.game.physics.startSystem(Phaser.Physics.ARCADE);
			this.game.world.enableBody = true;
			this.game.physics.arcade.gravity.y = 0;

			this.bulletTime = 0;

			// Setup our controls
			this.cursors = this.game.input.keyboard.createCursorKeys();
			this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

			// Settings for each level
			// Note: the first index is just a spacefiller since levels start from index 1
			this.keyCount = [0, 0, 0, 0, 0];
			this.robotStartingX = [0, 3, 3, 3, 3];
			this.robotStartingY = [0, 6, 6, 6, 6];
			this.robotDirection = "up";
			this.need = this.keyCount[this.level];


			// Initialize starting game elements
			this.collected = 0;


			this.createCurrLevel();
		}


		// Creates the current level with the map and all its associated elements.
		createCurrLevel() {
			// Set the startedNewLevel flag to true so that user's code will be rerun
			this.startedNewLevel = true;

			// Write a map from the JSON file to the current map variable.
			this.map = this.game.add.tilemap("map" + this.level);
			this.robotX = this.robotStartingX[this.level];
			this.robotY = this.robotStartingY[this.level];
			this.robotDirection = "up";

			this.createLevelGraphics();

			
		}


		createLevelGraphics() {
			// Set up tiles for the map above
			this.map.addTilesetImage("tiles");

			// Create a visual layer for the map above.
			// This completely covers up everything from the previous layer.
			this.layer = this.map.createLayer("Tile Layer 1");

			//this.layer.resizeWorld();

			// Animation Stuff
			// These are cleared everytime a new level is loaded
			this.actionLog = [];
			this.xHistory = [];
			this.yHistory = [];
			this.tweenChain = [];
			this.pauseUpdateFunction = false;
			this.tweenChainRunning = false;

			// Player robot stuff
			this.animationSpeed = 250; // Time in ms it takes to perform each animation (the smaller the faster).
			var robotFps = 4000/this.animationSpeed;

			this.robot = this.game.add.sprite(this.robotX*64, this.robotY*64, "robot"); // Starting position
			this.robot.animations.add("faceDown", [0],robotFps,false);
			this.robot.animations.add("faceLeft", [4],robotFps,false);
			this.robot.animations.add("faceRight", [8],robotFps,false);
			this.robot.animations.add("faceUp", [12],robotFps,false);
			this.robot.animations.add("moveDown", [0,1,2,3],robotFps,true);
			this.robot.animations.add("moveLeft", [4,5,6,7],robotFps,true);
			this.robot.animations.add("moveRight", [8,9,10,11],robotFps,true);
			this.robot.animations.add("moveUp", [12,13,14,15],robotFps,true);

			this.robot.animations.play("faceUp");



			this.game.physics.arcade.enable(this.robot);
			this.robot.body.allowGravity = false;
			this.robot.body.collideWorldBounds = true;

			
			// Setup game camera
			this.game.camera.follow(this.robot);

			// Setup the score
			this.scoreText = this.game.add.text(16, 16, 'Level ' + this.level, { fontSize: 32, fill: '#fff' });

			// State Text
			this.stateText = this.game.add.text(this.game.world.centerX,this.game.world.centerY,' ', { font: '48px Arial', fill: 'black' });
			this.stateText.anchor.setTo(0.5, 0.5);
			this.stateText.visible = false;

			this.map.setTileIndexCallback(3, this.hello, this);
		}


		// Updates internal game state based on the actions of the player.
		// This function can be run independently of the game's graphics.
		update() {

			// console.log(this.actionLog);

			
			//this.startTweenChain();

			
			// // Check for movement commands
			// if (this.cursors.left.isDown && this.cursors.right.isUp){
			// 	if (!this.flipFlop_l){
			// 		this.faceLeft();
			// 		this.flipFlop_l = true;
			// 		this.printRobot();
			// 	}
			// }
			// else if (this.cursors.left.isUp){
			// 	this.flipFlop_l = false;
			// }

			
			// if (this.cursors.right.isDown && this.cursors.left.isUp){
			// 	if (!this.flipFlop_r){
			// 		this.faceRight();
			// 		this.flipFlop_r = true;
			// 		this.printRobot();
			// 	}
			// }
			// else if (this.cursors.right.isUp){
			// 	this.flipFlop_r = false;
			// }
			
			
			// if (this.cursors.up.isDown  && this.cursors.down.isUp){
			// 	if (!this.flipFlop_u){
			// 		this.faceUp();
			// 		this.flipFlop_u = true;
			// 		this.printRobot();
			// 	}
			// }
			// else if (this.cursors.up.isUp){
			// 	this.flipFlop_u = false;
			// }
		  
			// if (this.cursors.down.isDown && this.cursors.up.isUp){
			// 	if (!this.flipFlop_d){
			// 		this.faceDown();
			// 		this.flipFlop_d = true;
			// 		this.printRobot();
			// 	}
			// }
			// else if (this.cursors.down.isUp){
			// 	this.flipFlop_d = false;
			// }

			// if (this.spaceKey.isDown){
			// 	if (!this.flipFlop_move){
			// 		this.moveForward();
			// 		this.flipFlop_move = true;
			// 		this.printRobot();
			// 	}
			// }
			// else if (this.spaceKey.isUp){
			// 	this.flipFlop_move = false;
			// }

		}



		addAllActionsToTweenChain() {

			for (var i = 0; i < this.actionLog.length; i++) {

				var currTween = this.game.add.tween(this.robot);

				if (this.actionLog[i] == "faceLeft") {
					currTween.to({}, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceLeft");
					}, this)
				}


				else if (this.actionLog[i] == "faceRight") {
					currTween.to({}, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceRight");
					}, this)
				}

				else if (this.actionLog[i] == "faceUp") {
					currTween.to({}, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceUp");
					}, this)
				}

				else if (this.actionLog[i] == "faceDown") {
					currTween.to({}, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceDown");
					}, this)
				}	

				else if (this.actionLog[i] == "moveLeft") {
					currTween.to({ x: this.xHistory[i]*64 }, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveLeft");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceLeft");
					}, this)
				}

				else if (this.actionLog[i] == "moveRight") {
					currTween.to({ x: this.xHistory[i]*64 }, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveRight");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceRight");
					}, this)
				}

				else if (this.actionLog[i] == "moveUp") {
					currTween.to({ y: this.yHistory[i]*64 }, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveUp");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceUp");
					}, this)
				}

				else if (this.actionLog[i] == "moveDown") {
					currTween.to({ y: this.yHistory[i]*64 }, this.animationSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveDown");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceDown");
					}, this)
				}			

				this.tweenChain.push(currTween);
				if (this.tweenChain.length > 1) {
					this.tweenChain[this.tweenChain.length-2].chain(this.tweenChain[this.tweenChain.length-1]);
				}

			}

			// Clear the action queue since it has all been added to the tween chain.
			this.actionLog = [];
			this.xHistory = [];
			this.yHistory = [];


		}

		startTweenChain() {
			if (this.tweenChain.length > 0) {

				// Start animation chain
				this.tweenChain[0].start();
				this.tweenChainRunning = true;

				this.tweenChain[this.tweenChain.length-1].onComplete.add(function() {  
					this.tweenChainRunning = false;
					this.tweenChain = [];
				}, this)
				
				// Clear all animation queues and data structures
				
			}
		}


		wonLevel() {
			console.log("Won level " + this.level);
			this.level++;
			this.addAllActionsToTweenChain();
			this.startTweenChain();
		}


		faceLeft() {
			this.robotDirection = "left";
			this.logAction("faceLeft");
		}

		faceRight() {
			this.robotDirection = "right";
			this.logAction("faceRight");
		}		

		faceUp() {
			this.robotDirection = "up";
			this.logAction("faceUp");
		}		

		faceDown() {
			this.robotDirection = "down";
			this.logAction("faceDown");
		}

		moveForward() {
			
			if (this.robotDirection == "left") {
				var tileLeft = this.map.getTileLeft(this.map.getLayer(), this.robotX, this.robotY);
				if (this.robotX > 0 && tileLeft.index != 1){
					this.robotX--;
					this.logAction("moveLeft");
				}
			}

			else if (this.robotDirection == "right") {
				var tileRight = this.map.getTileRight(this.map.getLayer(), this.robotX, this.robotY);
				if (tileRight.index != 1){ // add size of map factor
					this.robotX++;
					this.logAction("moveRight");
				}
			}

			else if (this.robotDirection == "up") {
				var tileAbove = this.map.getTileAbove(this.map.getLayer(), this.robotX, this.robotY);
				if (this.robotY > 0 && tileAbove.index != 1){
					this.robotY--;
					this.logAction("moveUp");
				}
			}

			else if (this.robotDirection == "down") {
				var tileBelow = this.map.getTileBelow(this.map.getLayer(), this.robotX, this.robotY);
				if (tileBelow.index != 1){ // add size of map factor
					this.robotY++;
					this.logAction("moveDown");
				}
			}

			// Check if won
			if (this.map.getTile(this.robotX, this.robotY, this.map.getLayer()).index == 3
				&& this.collected == this.need) {
				this.wonLevel();
			}

			
			
		}
		hello (sprite: Phaser.Sprite, tile: Phaser.Tile) {
			console.log("Hello");
		}


		printRobot() {
			console.log("x: " + this.robotX);
			console.log("y: " + this.robotY);
			console.log("Tile Type: " + this.map.getTile(this.robotX, this.robotY, this.map.getLayer()).index);
			console.log(this.actionLog);
		}

		logAction(action: string) {
			this.actionLog.push(action);
			this.xHistory.push(this.robotX);
			this.yHistory.push(this.robotY);
		}

	}
}
