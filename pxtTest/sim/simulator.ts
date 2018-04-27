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

		public move: Phaser.Tween;

		// Game config
		public levelCount: number;

		// User code processing
		public stepCount: number;
		public highestLevelReached: number;
		public RanAllLevels: number;

		public updateCounter: number;
		public pauseUpdate: boolean;

		// Game logic
		
		public map: any;
		public layer: any;
		public robotStartingX: any;
		public robotStartingY: any;
		public robotStartingDirection: any;

		public robotX: any; // Tile, not pixel
		public robotY: any; // Tile, not pixel
		public robotDirection: any;

		public results: any;

		public stepLimit: number;

		// Animation
		public currAnimatedLevel: number;

		public actionLog: any;
		public xHistory: any;
		public yHistory: any;

		public tweenChain: Phaser.Tween[];
		public walkSpeed: number;
		public turnSpeed: number;
		public tweenChainRunning: boolean;

		// Flip flops for keyboard controls
		public flipFlop_l: boolean;
		public flipFlop_r: boolean;
		public flipFlop_u: boolean;
		public flipFlop_d: boolean;
		public flipFlop_move: boolean;


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
			this.game.load.spritesheet("robot", "assets/images/GirlSprite.png", 64, 64, 16);
			this.game.load.image("tiles","assets/images/tiles.png");
			
			// Load in all maps that we have
			this.levelCount = 4;

			for (var i = 1; i <= this.levelCount; i++) {
				//Load just adds a Tile Map data file to the current load queue.
				//It doesn't seem to replace the initial load
				this.game.load.tilemap("map"+i,"maps/map"+i+".json",null,Phaser.Tilemap.TILED_JSON);
			}
		}

		// Create initial variables of the game.
		// Called once at start of game load.
		create() {

			// Setup game physics
			this.game.physics.startSystem(Phaser.Physics.ARCADE);
			this.game.world.enableBody = true;
			this.game.physics.arcade.gravity.y = 0;

			// Game frame counter
			this.updateCounter = 0;
			this.pauseUpdate = false;

			// Setup our controls
			this.cursors = this.game.input.keyboard.createCursorKeys();
			this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

			// Configurations
			this.stepLimit = 100;

			// Settings for each level
			// Note: the first index is just a spacefiller since levels start from index 1
			this.stepCount = 0;

			this.robotStartingX = [null, 3, 3, 3, 3];
			this.robotStartingY = [null, 6, 6, 6, 6];
			this.robotStartingDirection = [null,"up","up","up","up"];

			this.map = [null];
			this.robotX = [null];
			this.robotY = [null];
			this.robotDirection = [null];
			this.results = [null];

			this.actionLog = [null];
			this.xHistory = [null];
			this.yHistory = [null];

			// Initialize arrays for all levels
			for (var level = 1; level <= this.levelCount; level++) {
				this.map.push(this.game.add.tilemap("map" + level));
				this.robotX.push(this.robotStartingX[level]);
				this.robotY.push(this.robotStartingY[level]);
				this.robotDirection.push(this.robotStartingDirection[level]);
				this.results.push(0);

				this.actionLog.push([]);
				this.xHistory.push([]);
				this.yHistory.push([]);
			}



			// Initialize starting game elements
			this.tweenChain = [];

		}




		// Updates internal game state based on the actions of the player.
		// This function can be run independently of the game's graphics.
		// Default frequency is 60 times / sec
		update() {
			if (this.pauseUpdate == false) {
				
				this.updateCounter++;

				// Once counter reaches 2 secs, stop running user's code and begin the game
				if (this.updateCounter == 120) {
					console.log("Results: ", this.results);
					this.animateAllLevels(1);
					this.updateCounter = 0;
					this.pauseUpdate = true;

				}
			}
		}


		animateLevel(level: number, animateNextLevelIfWon: boolean) {

			// Update global "currently animated level" variable
			this.currAnimatedLevel = level;

			// Set up tiles for the current level's map
			this.map[level].addTilesetImage("tiles");

			// Create a visual layer for the map above.
			// This completely covers up everything from the previous layer.
			this.layer = this.map[level].createLayer("Tile Layer 1");

			//this.layer.resizeWorld();

			// Player robot stuff
			this.walkSpeed = 500; // Time in ms it takes to perform each animation (the lower the faster).
			this.turnSpeed = 500;
			var robotFps = 4000/this.walkSpeed;


			this.robot = this.game.add.sprite(this.robotStartingX[level]*64, this.robotStartingY[level]*64, "robot"); // Starting position
			this.robot.animations.add("faceDown", [0],robotFps,false);
			this.robot.animations.add("faceLeft", [4],robotFps,false);
			this.robot.animations.add("faceRight", [8],robotFps,false);
			this.robot.animations.add("faceUp", [12],robotFps,false);
			this.robot.animations.add("moveDown", [0,1,2,3],robotFps,true);
			this.robot.animations.add("moveLeft", [4,5,6,7],robotFps,true);
			this.robot.animations.add("moveRight", [8,9,10,11],robotFps,true);
			this.robot.animations.add("moveUp", [12,13,14,15],robotFps,true);

			this.robot.animations.play("face"+this.capitalizeFirstLetter(this.robotDirection[level]));

			this.robot.body.collideWorldBounds = true;
			
			// Setup game camera
			this.game.camera.follow(this.robot);

			// Write the current level text
			this.game.add.text(16, 16, 'Level ' + level, { fontSize: 24, fill: '#fff' });

			// State Text
			this.stateText = this.game.add.text(this.game.world.centerX,this.game.world.centerY,' ', { font: '48px Arial', fill: 'black' });
			this.stateText.anchor.setTo(0.5, 0.5);
			this.stateText.visible = false;


			if (animateNextLevelIfWon) {
				this.map[level].setTileIndexCallback(3, this.nextLevel, this);
			}

			else {
				this.map[level].setTileIndexCallback(3, this.doNothing, this);
			}

			// Start animating this level
			this.buildTweenChain(level);
			this.startTweenChain();
			
		}

		nextLevel() {
			this.animateLevel(this.currAnimatedLevel+1, true);
		}

		doNothing() {}


		buildTweenChain(level: number) {
			this.tweenChain = [];

			for (var i = 0; i < this.actionLog[level].length; i++) {

				var currTween = this.game.add.tween(this.robot);

				if (this.actionLog[level][i] == "faceLeft") {
					currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceLeft");
					}, this)
				}


				else if (this.actionLog[level][i] == "faceRight") {
					currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceRight");
					}, this)
				}

				else if (this.actionLog[level][i] == "faceUp") {
					currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceUp");
					}, this)
				}

				else if (this.actionLog[level][i] == "faceDown") {
					currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("faceDown");
					}, this)
				}	

				else if (this.actionLog[level][i] == "moveLeft") {
					currTween.to({ x: this.xHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveLeft");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceLeft");
						// Checks for collision between robot and layer.
						// This is needed for the collision callback to work.
						this.game.physics.arcade.collide(this.robot, this.layer);
					}, this)
				}

				else if (this.actionLog[level][i] == "moveRight") {
					currTween.to({ x: this.xHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveRight");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceRight");
						// Checks for collision between robot and layer.
						// This is needed for the collision callback to work.
						this.game.physics.arcade.collide(this.robot, this.layer);
					}, this)
				}

				else if (this.actionLog[level][i] == "moveUp") {
					currTween.to({ y: this.yHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveUp");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceUp");
						// Checks for collision between robot and layer.
						// This is needed for the collision callback to work.
						this.game.physics.arcade.collide(this.robot, this.layer);
					}, this)
				}

				else if (this.actionLog[level][i] == "moveDown") {
					currTween.to({ y: this.yHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
					currTween.onStart.add(function() {  
						this.robot.animations.play("moveDown");
					}, this)
					currTween.onComplete.add(function() {  
						this.robot.animations.play("faceDown");
						// Checks for collision between robot and layer.
						// This is needed for the collision callback to work.
						this.game.physics.arcade.collide(this.robot, this.layer);
					}, this)
				}			

				this.tweenChain.push(currTween);
				if (this.tweenChain.length > 1) {
					this.tweenChain[this.tweenChain.length-2].chain(this.tweenChain[this.tweenChain.length-1]);
				}

			}

		}

		startTweenChain() {
			
			if (this.tweenChain.length > 0) {

				// Start animation chain
				this.tweenChain[0].start();

			}
		}


		animateAllLevels(startingLevel: number) {
			this.animateLevel(startingLevel, true);
		}


		faceLeft() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					this.robotDirection[level] = "left";
					this.logAction("faceLeft", level);
				}
			}
		}

		faceRight() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					this.robotDirection[level] = "right";
					this.logAction("faceRight", level);
				}
			}
		}		

		faceUp() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					this.robotDirection[level] = "up";
					this.logAction("faceUp", level);
				}
			}
		}		

		faceDown() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					this.robotDirection[level] = "down";
					this.logAction("faceDown", level);
				}
			}
		}

		moveForward() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					if (this.robotDirection[level] == "left") {
						var tileLeft = this.map[level].getTileLeft(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
						if (this.robotX[level] > 0 && tileLeft.index != 1){
							this.robotX[level]--;
							this.logAction("moveLeft", level);
						}
					}

					else if (this.robotDirection[level] == "right") {
						var tileRight = this.map[level].getTileRight(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
						if (tileRight.index != 1){ // add size of map factor
							this.robotX[level]++;
							this.logAction("moveRight", level);
						}
					}

					else if (this.robotDirection[level] == "up") {
						var tileAbove = this.map[level].getTileAbove(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
						if (this.robotY[level] > 0 && tileAbove.index != 1){
							this.robotY[level]--;
							this.logAction("moveUp",level);
						}
					}

					else if (this.robotDirection[level] == "down") {
						var tileBelow = this.map[level].getTileBelow(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
						if (tileBelow.index != 1){ // add size of map factor
							this.robotY[level]++;
							this.logAction("moveDown", level);
						}
					}

					// Check if won
					if (this.map[level].getTile(this.robotX[level], this.robotY[level], this.map[level].getLayer()).index == 3) {
						this.results[level] = 1;
					}
				}
			}		
		}



		hello (sprite: Phaser.Sprite, tile: Phaser.Tile) {
			console.log("Hello");
			console.log("Hello");
			console.log("Hello");
			console.log("Hello");
		}


		printLevel(level: number) {
			console.log("Won level " + level);
			console.log("robotCurrentX: " + this.robotX[level]);
			console.log("robotCurrentY: " + this.robotY[level]);
			console.log("actionLog: " + this.actionLog[level]);
			console.log("xHistory: " + this.xHistory[level]);
			console.log("yHistory: " + this.yHistory[level]);
		}

		logAction(action: string, level: number) {
			this.actionLog[level].push(action);
			this.xHistory[level].push(this.robotX[level]);
			this.yHistory[level].push(this.robotY[level]);
		}


		capitalizeFirstLetter(str: string) {
    		return str.charAt(0).toUpperCase() + str.slice(1);
		}
	}
}










