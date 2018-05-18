# Private Eye - Cornell MPS project Team

![](screenshots/main.png)

Private Eye is a maze solver coding game. The player must direct the main character, Private Eye, through a series of mazes by constructing a single piece of code.  Players can drag code blocks to the playground to build their own logic, and program the robot to reach the goal. There are 10 mazes in total, each of increasing difficulty. The user's code will be run against all 10 levels. Private Eye is built on [Microsoft MakeCode](https://github.com/Microsoft/pxt).

- Try it live: [https://zh324.github.io/Private-Eye](https://zh324.github.io/Private-Eye)

- More makecode examples: [Makecode Labs](https://makecode.com/labs)

## Game Preview

![](screenshots/overview.png)

## API design

* Current API functions: 
```
walkForward(), turnLeft(), turnRight(), faceNorth(), faceSouth(), faceWest(), faceEast()
```
* TODOs:
```
wallAhead(), Breadth First Search
```
## Code example
 ```
  // This piece of code can pass through up to level 6
  
   Robot.faceUp()
   for (let i = 0; i < 5; i++) {
       Robot.moveForward()
   }
   Robot.turnRight()
   Robot.moveForward()
   Robot.turnLeft()
   for (let i = 0; i < 5; i++) {
       Robot.moveForward()
   }
 ```
## Charater design

* character evolution

![](screenshots/char_evolution.png)

* character final design

![](screenshots/char_design.png)

## Running locally

Follow these instructions to set up and run the game locally.

### Setup

The following commands are a 1-time setup after synching the repo on your machine.

* install [node.js](https://nodejs.org/en/)

* install the PXT command line
```
npm install -g pxt
```
* install the dependencies
```
npm install
```

### Running the local server

After you're done, simple run this command to open a local web server:
```
pxt serve
```

After making a change in the source, refresh the page in the browser.

## Updating the tools

If you would like to pick up the latest PXT build, simply run
```
pxt update
```

More instructions at https://github.com/Microsoft/pxt#running-a-target-from-localhost 
