# Private Eye - Cornell MPS project Team

This repo contains a maze game built with [Microsoft MakeCode](https://github.com/Microsoft/pxt). 

- Try it alive: [https://zh324.github.io/Private-Eye](https://zh324.github.io/Private-Eye)

## Game Preview

![](screenshots/overview.png)

## Game Preview

API design
* walkForward(), turnLeft(), turnRight(), faceNorth(), faceSouth(), faceWest(), faceEast()
* TODOs: wallAhead(), Breadth First Search

## Running locally

These instructions allow to run locally to play the game.

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
