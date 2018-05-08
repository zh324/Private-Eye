/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

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
		public robotStartingX: any; //array
		public robotStartingY: any; //array
		public terminalX: any;
		public terminalY: any;
		public robotStartingDirection: any; //array

		public robotX: any; // Tile, not pixel
		public robotY: any; // Tile, not pixel
		public robotDirection: any;
		
		public results: any;

		public blockLimit: number;

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

		//html elements
		public button1: HTMLInputElement;
		public button2: HTMLInputElement;
		public button3: HTMLInputElement;
		public button4: HTMLInputElement;
		public button5: HTMLInputElement;
		public button6: HTMLInputElement;
		public button7: HTMLInputElement;
		public contentDiv: HTMLDivElement;

		public levelMatrix: any;


		constructor() {
			super();
			this.bus = new EventBus(runtime);
			this.button1 = <HTMLInputElement><any>document.getElementById("level1");
			this.button2 = <HTMLInputElement><any>document.getElementById("level2");
			this.button3 = <HTMLInputElement><any>document.getElementById("level3");
			this.button4 = <HTMLInputElement><any>document.getElementById("level4");
			this.button5 = <HTMLInputElement><any>document.getElementById("level5");
			this.button6 = <HTMLInputElement><any>document.getElementById("level6");
			this.button7 = <HTMLInputElement><any>document.getElementById("level7");
			this.contentDiv = <HTMLDivElement><any>document.getElementById("contentDiv");
		}


		initAsync(msg: pxsim.SimulatorRunMessage): Promise<void> {

			postContainerMessage({
				type: "simulator.message",
				key: "init"
			});
			let that = this;
			this.contentDiv.innerHTML = "";
			return new Promise<void>((resolve, reject) => {
				this.game = new Phaser.Game(448, 704, Phaser.AUTO, "contentDiv", {
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
			this.levelCount = 7;
			this.highestLevelReached = 0;

			for (var i = 1; i <= this.levelCount; i++) {
				//Load just adds a Tile Map data file to the current load queue.
				//It doesn't seem to replace the initial load
				this.game.load.tilemap("level"+i,"maps/level"+i+".json",null,Phaser.Tilemap.TILED_JSON);
			}
		}


		// Create initial variables of the game.
		// Called once at start of game load.
		create() {
			console.log(typeof(window.localStorage["level1"]));
			if (typeof(window.localStorage["level1"]) == "undefined") { 
				console.log("I'm here")
				this.reset();
			}

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
			this.blockLimit = 100;

			// Settings for each level
			// Note: the first index is just a spacefiller since levels start from index 1
			this.stepCount = 0;

			this.robotStartingX = [null, 3, 3, 3, 3, 3, 3, 3];
			this.robotStartingY = [null, 5, 6, 6, 10, 10, 10, 10];
			this.robotStartingDirection = [null,"up","up","left","up","up","up","up"];
			this.terminalX = [null, 3, 3, 3, 3, 4, 3, 1];
			this.terminalY = [null, 4, 4, 4, 0, 0, 0, 0];

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
				this.map.push(this.game.add.tilemap("level" + level));
				this.robotX.push(this.robotStartingX[level]);
				this.robotY.push(this.robotStartingY[level]);
				this.robotDirection.push(this.robotStartingDirection[level]);
				this.results.push(0);

				this.actionLog.push([]);
				this.xHistory.push([]);
				this.yHistory.push([]);
			}

			//add event listener to buttons
			this.button1.addEventListener("click", (e:Event) => this.triggerButtonClick(1));
			this.button2.addEventListener("click", (e:Event) => this.triggerButtonClick(2));
			this.button3.addEventListener("click", (e:Event) => this.triggerButtonClick(3));
			this.button4.addEventListener("click", (e:Event) => this.triggerButtonClick(4));
			this.button5.addEventListener("click", (e:Event) => this.triggerButtonClick(5));
			this.button6.addEventListener("click", (e:Event) => this.triggerButtonClick(6));
			this.button7.addEventListener("click", (e:Event) => this.triggerButtonClick(7));

			//initialize level matrix
			this.levelMatrix = [];
            this.levelMatrix[0] = [[1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1]];
            this.levelMatrix[1] = [[1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 3, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1]];
            this.levelMatrix[2] = [[1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 3, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1]];
            this.levelMatrix[3] = [[1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 3, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1], 
                                    [1, 1, 1, 1, 1, 1, 1]];
            this.levelMatrix[4] = [[1, 1, 1, 3, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1]];
            this.levelMatrix[5] = [[1, 1, 1, 1, 3, 1, 1], 
                                    [1, 1, 1, 1, 2, 1, 1], 
                                    [1, 1, 1, 1, 2, 1, 1], 
                                    [1, 1, 1, 1, 2, 1, 1], 
                                    [1, 1, 1, 1, 2, 1, 1], 
                                    [1, 1, 1, 2, 2, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1]];
            this.levelMatrix[6] = [[1, 1, 1, 3, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 2, 2, 2, 1, 1, 1], 
                                    [1, 2, 1, 1, 1, 1, 1], 
                                    [1, 2, 2, 2, 2, 2, 1], 
                                    [1, 1, 1, 1, 1, 2, 1], 
                                    [1, 1, 1, 2, 2, 2, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1]];
            this.levelMatrix[7] = [[1, 3, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 1, 1, 1, 2, 1], 
                                    [1, 2, 2, 2, 2, 2, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1], 
                                    [1, 1, 1, 2, 1, 1, 1]];

		}


		// Updates internal game state based on the actions of the player.
		// This function can be run independently of the game's graphics.
		// Default frequency is 60 times / sec
		update() {
			if (this.pauseUpdate == false) {
				this.updateCounter++;

				// Once counter reaches 2 secs, stop running user's code and begin the game
				if (this.updateCounter == 100) {
					this.updateLevelState();
					console.log("Results: ", this.results);
					for (var level = 1; level < this.levelCount; level++) {
						this.changeIcon(level);
					}
					this.animateAllLevels(1);
					this.updateCounter = 0;
					this.pauseUpdate = true;

				}
			}
		}

		
		reset() {
			for (var level = 1; level < this.levelCount; level++) {
				window.localStorage["level" + level] = "lock";
				window.localStorage["successHistory" + level] = "no";
				console.log(window.localStorage["level" + level])
			}
			window.localStorage["absoluteHighestLevel"] = 0;

		}


		//constantly updating level states, called in update()
		updateLevelState() {
			for (var level = 1; level < this.levelCount; level++) {
				if (this.results[level] == 0) {
					this.highestLevelReached = level;
					var temp = window.localStorage["absoluteHighestLevel"];
					window.localStorage["absoluteHighestLevel"] = Math.max(temp, level);
					break;
				}
			}

			for (var level = 1; level < this.levelCount; level++) {
				var hs = window.localStorage["absoluteHighestLevel"];
				var history = window.localStorage["successHistory" + level];
				if (level < this.highestLevelReached) {
					if (history == "no") {
						window.localStorage["level" + level] = "success1";
						window.localStorage["successHistory" + level] = "yes";
					} else if (history == "yes") {
						window.localStorage["level" + level] = "successN";
					}
				} else {
					if (level == this.highestLevelReached) {
						window.localStorage["level" + level] = "fail";
					} else if (level > this.highestLevelReached && level <= hs) {
						window.localStorage["level" + level] = "unlock";
					} else if (level > hs) {
						window.localStorage["level" + level] = "lock";
					}
				}
			}
		}


		//change button icon for a certain level
		changeIcon(level : number) {
			let icon;
			let state = window.localStorage["level" + level];
			if (state == "success1" || state == "successN") {
				icon = "assets/images/yes.png";
			} else if (state == "fail") {
				icon = "assets/images/no.png";
			} else if (state == "unlock") {
				icon = "assets/images/unlock.png";
			} else if (state == "lock") {
				icon = "assets/images/lock.png";
			}

			switch(level) {
				case 1:
					this.button1.src = icon;
					break;
				case 2:
					this.button2.src = icon;
					break;
				case 3:
					this.button3.src = icon;
					break;
				case 4:
					this.button4.src = icon;
					break;
				case 5:
					this.button5.src = icon;
					break;
				case 6:
					this.button6.src = icon;
					break;
				case 7:
					this.button7.src = icon;
					break;
				default:
			}
		}


		triggerButtonClick(level : number) {
			var state = window.localStorage["level" + level];
			if (level <= this.highestLevelReached) {
				//only run current level, set "false"
				this.animateLevelForButton(level, false);
			}
		}


		animateLevelForButton(level: number, animateNextLevelIfWon: boolean) {
			var state = window.localStorage["level" + level];

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
		
			this.buildTweenChain(level);
			this.startTweenChain();
		}


		animateAllLevels(startingLevel: number) {
			this.animateLevel(startingLevel, true);
		}


		/*order: animateAllLevels -> animateLevel -> buildTweenChain -> startTweenChain*/
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

			var state = window.localStorage["level" + level];
			if (state == "success1" || state == "fail") {
				this.buildTweenChain(level);
				this.startTweenChain();
			} else {
				this.nextLevel();
			}
			
		}


		nextLevel() {
			this.animateLevel(this.currAnimatedLevel + 1, true);
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


		wallAhead() {
			var level = this.currAnimatedLevel;
			if (this.robotDirection[level] == "left") {
				var tileLeft = this.map[level].getTileLeft(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
				console.log(tileLeft.index != 1);
				return tileLeft.index == 1;
			}

			else if (this.robotDirection[level] == "right") {
				var tileRight = this.map[level].getTileRight(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
				console.log(tileRight.index != 1);
				return tileRight.index == 1;
			}

			else if (this.robotDirection[level] == "up") {
				var tileAbove = this.map[level].getTileAbove(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
				console.log(tileAbove.index != 1);
				return tileAbove.index == 1;
			}

			else if (this.robotDirection[level] == "down") {
				var tileBelow = this.map[level].getTileBelow(this.map[level].getLayer(), this.robotX[level], this.robotY[level]);
				console.log(tileBelow.index != 1);
				return tileBelow.index == 1;
			}	
			return false;
		}


		moveForward() {
			for (var level = 1; level <= this.levelCount; level++) {
				//not won yet
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


		turnLeft() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					if (this.robotDirection[level] == "left") {
						this.robotDirection[level] = "down";
						this.logAction("faceDown", level);
					} else if (this.robotDirection[level] == "up") {
						this.robotDirection[level] = "left";
						this.logAction("faceLeft", level);
					} else if (this.robotDirection[level] == "right") {
						this.robotDirection[level] = "up";
						this.logAction("faceUp", level);
					} else if (this.robotDirection[level] == "down") {
						this.robotDirection[level] = "right";
						this.logAction("faceRight", level);
					}
				}
			}
		}


		turnRight() {
			for (var level = 1; level <= this.levelCount; level++) {
				if (this.results[level] == 0) {
					if (this.robotDirection[level] == "left") {
						this.robotDirection[level] = "up";
						this.logAction("faceUp", level);
					} else if (this.robotDirection[level] == "up") {
						this.robotDirection[level] = "right";
						this.logAction("faceRight", level);
					} else if (this.robotDirection[level] == "right") {
						this.robotDirection[level] = "down";
						this.logAction("faceDown", level);
					} else if (this.robotDirection[level] == "down") {
						this.robotDirection[level] = "left";
						this.logAction("faceLeft", level);
					}
				}
			}
		}


		printLevel(level: number) {
			console.log("Won level " + level);
			console.log("robotCurrentX: " + this.robotX[level]);
			console.log("robotCurrentY: " + this.robotY[level]);
			console.log("actionLog: " + this.actionLog[level]);
			console.log("xHistory: " + this.xHistory[level]);
			console.log("yHistory: " + this.yHistory[level]);
		}


		//update action log for a certain level
		logAction(action: string, level: number) {
			this.actionLog[level].push(action);
			this.xHistory[level].push(this.robotX[level]);
			this.yHistory[level].push(this.robotY[level]);
		}


		capitalizeFirstLetter(str: string) {
    		return str.charAt(0).toUpperCase() + str.slice(1);
		}


		printSomething(strArray: number[][]) {
			for (var i = 0; i < strArray.length; i++) {
				console.log(strArray[0] + ',' + strArray[1]);
			}
		}


		triggerBFS() {
			this.actionLog = [null];
			for (var level = 1; level <= this.levelCount; level++) {
				var path = this.BFS(level);
				this.actionLog.push(this.getLevelActionLog(path));
				this.getLevelPositionHistory(path, level);
			}
		}


		getLevelPositionHistory(path: any, level: number) {
			var length = path.length;
			for (var i = length - 1; i >= 0; i--) {
				this.xHistory[level].push(path[i][1]);
				this.yHistory[level].push(path[i][0]);
			}
			this.xHistory[level].push(this.terminalX[level]);
			this.yHistory[level].push(this.terminalY[level]);
		}

		getLevelActionLog(path: any) {
			var result = [];
			var length = path.length;
			var cur, next;
			for (var i = length - 1; i >= 1; i--) {
				cur = i, next = i - 1;
				if (path[next][0] == path[cur][0] - 1) {
					result.push("faceUp");
					result.push("moveForward");
				} else if (path[next][0] == path[cur][0] + 1) {
					result.push("faceDown");
					result.push("moveForward");
				} else if (path[next][1] == path[cur][1] - 1) {
					result.push("faceLeft");
					result.push("moveForward");
				} else if (path[next][1] == path[cur][1] + 1) {
					result.push("faceRight");
					result.push("moveForward");
				}
			}
			result.push("faceUp");
			result.push("moveForward");
			return result;
		}

		BFS(level: number) {
			let N = 11, M = 7;
			let new_node: number[] = []
			let path_node: number[] = []

			let nei: number[] = []
			let cur: number[] = []

			let matrix: number[][] = []
			let visited: number[][] = [] //avoid duplication
			let end: number[] = []
			let start: number[] = []

			//four directions
			let directionY: number[] = []
			let directionX: number[] = []

			let queue: number[][] = [] //for BFS
			let stack: number[][] = [] //for backtracking
			let result: number[][] = []
			result = []
			stack = []
			queue = []

			directionX = [1, 0, -1, 0]
			directionY = [0, 1, 0, -1]

			start = [this.robotStartingY[level], this.robotStartingX[level], 0, 0];
			end = [this.terminalY[level], this.terminalX[level], 0, 0];

			visited = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]
			matrix = this.levelMatrix[level];

			cur = [0, 0, 0, 0]
			nei = [0, 0, 0, 0]
			queue.push(start)
			visited[start[0]][start[1]] = 1

			while (queue.length != 0) {
				cur = queue.shift()
				stack.push(cur)
				for (let i = 0; i <= 4 - 1; i++) {
					nei[0] = cur[0] + directionX[i]
					nei[1] = cur[1] + directionY[i]
					nei[2] = cur[0]
					nei[3] = cur[1]
					if (nei[0] == end[0] && nei[1] == end[1]) {
						while (stack.length != 0) {
							path_node = stack.pop()
							if (nei[2] == path_node[0] && nei[3] == path_node[1]) {
								result.push([path_node[0], path_node[1], path_node[2], path_node[3]])
								nei = path_node
							}
						}
					}
					if (nei[0] >= 0 && nei[0] < N && nei[1] >= 0 && nei[1] < M && !(visited[nei[0]][nei[1]]) && (matrix[nei[0]][nei[1]] == 2 || matrix[nei[0]][nei[1]] == 3)) {
						new_node = [nei[0], nei[1], nei[2], nei[3]]
						queue.push(new_node)
						visited[nei[0]][nei[1]] = 1
					}
				}
			}
			return result;
		}
	}
}










