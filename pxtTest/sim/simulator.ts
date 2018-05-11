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
	let myBoard: Board;
	let actionLog: any;
	let xHistory: any;
	let yHistory: any;
	let results : any;
   
	actionLog = [null];
	xHistory = [null];
	yHistory = [null];
	results = [null];
   
	for (var level = 1; level <= 7; level++) {
	 results.push(0);
	 actionLog.push([]);
	 xHistory.push([]);
	 yHistory.push([]);
	}
	
   
	let currLevel = 1;
   
	//It only stores never-changing variables.
	let levelCount = 7;
	let robotStartingXArray = [null, 3, 3, 3, 3, 3, 3, 3];
	let robotStartingYArray = [null, 5, 6, 6, 10, 10, 10, 10];
	let robotStartingDirectionArray = [null,"up","up","left","up","up","up","up"];
	let terminalXArray = [null, 3, 3, 3, 3, 4, 3, 1];
	let terminalYArray = [null, 4, 4, 4, 0, 0, 0, 0];
   
	initCurrentRuntime = () => {
   
	 myBoard = new Board();
	 runtime.board = myBoard;
	 let oldRun = runtime.run; 
	 for (var level = 1; level < levelCount; level++) {
	  console.log("enter")
	  runtime.run = (cb: ResumeFn) => { 
	   oldRun(cb);
	  }
	  if (results[currLevel] == 0) {
	   break;
	  }
	  currLevel++;
	 }
	}
   
   
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
   
	 public updateCounter: number;
	 public pauseUpdate: boolean;
   
	 // Game logic
	 public map: any;
	 public layer: any;
	 public robotStartingX: any;
	 public robotStartingY: any;
	 public terminalX: any;
	 public terminalY: any;
	 public robotStartingDirection: any;
   
	 public robotX: any; // Tile, not pixel
	 public robotY: any; // Tile, not pixel
	 public robotDirection: any;
   
	 public tweenChain: Phaser.Tween[];
	 public walkSpeed: number;
	 public turnSpeed: number;
	 public tweenChainRunning: boolean;
   
	 public contentDiv: HTMLDivElement;
   
	 public bgm: Phaser.Sound;
	 public hitWall: Phaser.Sound;
	 public winStage: Phaser.Sound;
	 public fireButton: Phaser.Key;
	 public bulletTime: number;




	 constructor() {
	  super();
	  this.bus = new EventBus(runtime);
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
	  this.game.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1);   
	  this.game.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1);   
	  this.game.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1);    
	  this.game.load.image("tiles","assets/images/tiles.png");
	  this.game.load.image('bullet', 'assets/images/new_bullet.png');    
	  this.game.load.tilemap("level"+currLevel,"maps/level"+currLevel+".json",null,Phaser.Tilemap.TILED_JSON);
	  this.game.load.audio('bgm', 'assets/sounds/Old-World-Vanishing.mp3');
	  this.game.load.audio('hitWall', 'assets/sounds/bump.mp3');
	  this.game.load.audio('win', 'assets/sounds/win.mp3');


	 }
   
   
	 // Create initial variables of the game.
	 // Called once at start of game load.
	 create() {

		this.bgm = this.game.add.audio('bgm');
		this.bgm.play();

		this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.bulletTime = 0;
   
	  // Setup game physics
	  this.game.physics.startSystem(Phaser.Physics.ARCADE);
	  this.game.world.enableBody = true;
	  this.game.physics.arcade.gravity.y = 0;
   
	  // Game frame counter
	  this.updateCounter = 0;
	  this.pauseUpdate = false;
   
	  this.robotStartingX = robotStartingXArray[currLevel];
	  this.robotStartingY = robotStartingYArray[currLevel];
	  this.robotStartingDirection = robotStartingDirectionArray[currLevel];
	  this.terminalX = terminalXArray[currLevel];
	  this.terminalY = terminalYArray[currLevel];
   
	  // Initialize arrays for current level
	  this.map = this.game.add.tilemap("level" + currLevel);
	  this.robotX = this.robotStartingX;
	  this.robotY = this.robotStartingY;
	  this.robotDirection = this.robotStartingDirection;
	  results[currLevel] = 0;
	 }
   
   
	 // Updates internal game state based on the actions of the player.
	 // This function can be run independently of the game's graphics.
	 // Default frequency is 60 times / sec
	 update() {
	  if (this.pauseUpdate == false) {
	   this.updateCounter++;
   
	   // Once counter reaches 2 secs, stop running user's code and begin the game
	   if (this.updateCounter == 100) {
		// this.updateLevelState();
		console.log("Result: " + currLevel + " " , results[currLevel]);
		// this.changeIcon(currLevel);
		this.animateLevel(currLevel, false);
		this.updateCounter = 0;
		this.pauseUpdate = true;
	   }
	  }
	 }
   
   
	 animateLevel(level: number, animateNextLevelIfWon: boolean) {
   
	  // Set up tiles for the current level's map
	  this.map.addTilesetImage("tiles");
   
	  // Create a visual layer for the map above.
	  // This completely covers up everything from the previous layer.
	  this.layer = this.map.createLayer("Tile Layer 1");
   
	  //this.layer.resizeWorld();
   
	  // Player robot stuff
	  this.walkSpeed = 500; // Time in ms it takes to perform each animation (the lower the faster).
	  this.turnSpeed = 500;
	  var robotFps = 4000/this.walkSpeed;
   
	  this.robot = this.game.add.sprite(this.robotStartingX*64, this.robotStartingY*64, "robot"); // Starting position
	  this.robot.animations.add("faceDown", [0],robotFps,false);
	  this.robot.animations.add("faceLeft", [4],robotFps,false);
	  this.robot.animations.add("faceRight", [8],robotFps,false);
	  this.robot.animations.add("faceUp", [12],robotFps,false);
	  this.robot.animations.add("moveDown", [0,1,2,3],robotFps,true);
	  this.robot.animations.add("moveLeft", [4,5,6,7],robotFps,true);
	  this.robot.animations.add("moveRight", [8,9,10,11],robotFps,true);
	  this.robot.animations.add("moveUp", [12,13,14,15],robotFps,true);
   
	  this.robot.animations.play("face"+this.capitalizeFirstLetter(this.robotDirection));
   
	  this.robot.body.collideWorldBounds = true;
	  
	  // Setup game camera
	  this.game.camera.follow(this.robot);
   
	  // Write the current level text
	  this.game.add.text(16, 16, 'Level ' + level, { fontSize: 24, fill: '#fff' });
   
	  // State Text
	  this.stateText = this.game.add.text(this.game.world.centerX,this.game.world.centerY,' ', { font: '48px Arial', fill: 'black' });
	  this.stateText.anchor.setTo(0.5, 0.5);
	  this.stateText.visible = false;
	//   this.map[level].setTileIndexCallback(3, this.winMusic(), this);
	  this.buildTweenChain(level);
	  this.startTweenChain();
	 }
   
   
	 doNothing() {}
   
	 buildTweenChain(level: number) {
	  this.tweenChain = [];
   
	  for (var i = 0; i < actionLog[level].length; i++) {
   
	   var currTween = this.game.add.tween(this.robot);
   
	   if (actionLog[level][i] == "faceLeft") {
		currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("faceLeft");
		}, this)
	   }
   
	   else if (actionLog[level][i] == "faceRight") {
		currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("faceRight");
		}, this)
	   }
   
	   else if (actionLog[level][i] == "faceUp") {
		currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("faceUp");
		}, this)
	   }
   
	   else if (actionLog[level][i] == "faceDown") {
		currTween.to({}, this.turnSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("faceDown");
		}, this)
	   } 
   
	   else if (actionLog[level][i] == "moveLeft") {
		currTween.to({ x: xHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("moveLeft");
		}, this)
		currTween.onComplete.add(function() {  
		 this.robot.animations.play("faceLeft");
		 // Checks for collision between robot and layer.
		 // This is needed for the collision callback to work.
		 this.game.physics.arcade.collide(this.robot, this.layer, this.collideMusic());
		 this.game.physics.arcade.overlap(this.robot, this.layer, this.winMusic());
		 if(this.robot.body.blocked.up || this.robot.body.blocked.down || this.robot.body.blocked.left || this.robot.body.blocked.right) { console.log('play sound <.:| ');}

		}, this)
	   }
   
	   else if (actionLog[level][i] == "moveRight") {
		currTween.to({ x: xHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("moveRight");

		}, this)
		currTween.onComplete.add(function() {  
		 this.robot.animations.play("faceRight");
		 // Checks for collision between robot and layer.
		 // This is needed for the collision callback to work.
		 this.game.physics.arcade.collide(this.robot, this.layer, this.collideMusic());
		 this.game.physics.arcade.overlap(this.robot, this.layer, this.winMusic());
		 if(this.robot.body.blocked.up || this.robot.body.blocked.down || this.robot.body.blocked.left || this.robot.body.blocked.right) { console.log('play sound <.:| ');}

		}, this)
	   }
   
	   else if (actionLog[level][i] == "moveUp") {
		currTween.to({ y: yHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("moveUp");
		}, this)
		currTween.onComplete.add(function() {  
		 this.robot.animations.play("faceUp");
		 // Checks for collision between robot and layer.
		 // This is needed for the collision callback to work.
		 this.game.physics.arcade.collide(this.robot, this.layer, this.collideMusic());
		 this.game.physics.arcade.overlap(this.robot, this.layer, this.winMusic());

		 if(this.robot.body.blocked.up || this.robot.body.blocked.down || this.robot.body.blocked.left || this.robot.body.blocked.right) { console.log('play sound <.:| ');}

		}, this)
	   }
   
	   else if (actionLog[level][i] == "moveDown") {
		currTween.to({ y: yHistory[level][i]*64 }, this.walkSpeed, Phaser.Easing.Linear.None, false)
		currTween.onStart.add(function() {  
		 this.robot.animations.play("moveDown");
		}, this)
		currTween.onComplete.add(function() {  
		 this.robot.animations.play("faceDown");
		 // Checks for collision between robot and layer.
		 // This is needed for the collision callback to work.
		 this.game.physics.arcade.collide(this.robot, this.layer, this.collideMusic());
		 this.game.physics.arcade.overlap(this.robot, this.layer, this.winMusic());

		 if(this.robot.body.blocked.up || this.robot.body.blocked.down || this.robot.body.blocked.left || this.robot.body.blocked.right) { console.log('play sound <.:| ');}

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
	  if (results[currLevel] == 0) {
	   this.robotDirection = "left";
	   this.logAction("faceLeft", currLevel);
	  }
	 }
   
   
	 faceRight() {
	  if (results[currLevel] == 0) {
	   this.robotDirection = "right";
	   this.logAction("faceRight", currLevel);
	  }
	 }  
   
   
	 faceUp() {
	  if (results[currLevel] == 0) {
	   this.robotDirection = "up";
	   this.logAction("faceUp", currLevel);
	  }
	 }  
   
   
	 faceDown() {
	  if (results[currLevel] == 0) {
	   this.robotDirection = "down";
	   this.logAction("faceDown", currLevel);
	  }
	 }
   
   
	 wallAhead() {
	  if (results[currLevel] == 0) {
	   if (this.robotDirection == "left") {
		var tileLeft = this.map.getTileLeft(this.map.getLayer(), this.robotX, this.robotY);
		console.log(tileLeft.index == 1);
		return tileLeft.index == 1;
	   }
   
	   else if (this.robotDirection == "right") {
		var tileRight = this.map.getTileRight(this.map.getLayer(), this.robotX, this.robotY);
		console.log(tileRight.index == 1);
		return tileRight.index == 1;
	   }
   
	   else if (this.robotDirection == "up") {
		var tileAbove = this.map.getTileAbove(this.map.getLayer(), this.robotX, this.robotY);
		console.log(tileAbove.index == 1);
		return tileAbove.index == 1;
	   }
	
	   else if (this.robotDirection == "down") {
		var tileBelow = this.map.getTileBelow(this.map.getLayer(), this.robotX, this.robotY);
		console.log(tileBelow.index == 1);
		return tileBelow.index == 1;
	   }
	  }
	  return false;
	 }
   
   
	 moveForward() {
	   //not won yet
	   if (results[currLevel] == 0) {
		if (this.robotDirection == "left") {
		 var tileLeft = this.map.getTileLeft(this.map.getLayer(), this.robotX, this.robotY);
		 if (this.robotX > 0 && tileLeft.index != 1){
		  this.robotX--;
		  this.logAction("moveLeft", currLevel);
		 }
		}
   
		else if (this.robotDirection == "right") {
		 var tileRight = this.map.getTileRight(this.map.getLayer(), this.robotX, this.robotY);
		 if (tileRight.index != 1){ // add size of map factor
		  this.robotX++;
		  this.logAction("moveRight", currLevel);
		 }
		}
   
		else if (this.robotDirection == "up") {
		 var tileAbove = this.map.getTileAbove(this.map.getLayer(), this.robotX, this.robotY);
		 if (this.robotY > 0 && tileAbove.index != 1){
		  this.robotY--;
		  this.logAction("moveUp",currLevel);
		 }
		}
   
		else if (this.robotDirection == "down") {
		 var tileBelow = this.map.getTileBelow(this.map.getLayer(), this.robotX, this.robotY);
		 if (tileBelow.index != 1){ // add size of map factor
		  this.robotY++;
		  this.logAction("moveDown", currLevel);
		 }
		}
   
		// Check if won
		if (this.map.getTile(this.robotX, this.robotY, this.map.getLayer()).index == 3) {
		 results[currLevel] = 1;
		}
	   }
		
	 }
   
	 turnLeft() {
	  if (results[currLevel] == 0) {
	   if (this.robotDirection == "left") {
		this.robotDirection = "down";
		this.logAction("faceDown", currLevel);
	   } else if (this.robotDirection == "up") {
		this.robotDirection = "left";
		this.logAction("faceLeft", currLevel);
	   } else if (this.robotDirection == "right") {
		this.robotDirection = "up";
		this.logAction("faceUp", currLevel);
	   } else if (this.robotDirection == "down") {
		this.robotDirection = "right";
		this.logAction("faceRight", currLevel);
	   }
	  }
	 }
   
   
	 turnRight() {
	  if (results[currLevel] == 0) {
	   if (this.robotDirection == "left") {
		this.robotDirection = "up";
		this.logAction("faceUp", currLevel);
	   } else if (this.robotDirection == "up") {
		this.robotDirection = "right";
		this.logAction("faceRight", currLevel);
	   } else if (this.robotDirection == "right") {
		this.robotDirection = "down";
		this.logAction("faceDown", currLevel);
	   } else if (this.robotDirection == "down") {
		this.robotDirection = "left";
		this.logAction("faceLeft", currLevel);
	   }
	  }
	 }
   
   
	 //update action log for a certain level
	 logAction(action: string, level: number) {
	  actionLog[level].push(action);
	  xHistory[level].push(this.robotX);
	  yHistory[level].push(this.robotY);
	 }
   
   
	 capitalizeFirstLetter(str: string) {
		 return str.charAt(0).toUpperCase() + str.slice(1);
	 }

	 collideMusic(){
		if (this.map.getTile(this.robotX, this.robotY, this.map.getLayer()).index != 3) {
			this.hitWall = this.game.add.audio('hitWall');
			this.hitWall.play();
		   }
	 }

	 winMusic(){
		if (this.map.getTile(this.robotX, this.robotY, this.map.getLayer()).index == 3){
		
		this.winStage = this.game.add.audio('win');
		this.bgm.pause();
		this.winStage.play();
		this.bgm.resume();
		
		}
	 }
   
	}
   }