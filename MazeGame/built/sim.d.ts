/// <reference path="../libs/core/enums.d.ts" />
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts" />
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />
declare namespace pxsim.Robot {
    /**
     * Moves the robot forward by 1 cell.
     */
    function moveForwardAsync(): Promise<void>;
    /**
     * Makes the robot turn left.
     */
    function turnLeftAsync(): Promise<void>;
    /**
     * Makes the robot turn right.
     */
    function turnRightAsync(): Promise<void>;
    /**
     * Makes the robot face up north.
     */
    function faceUpAsync(): Promise<void>;
    /**
     * Makes the robot face south.
     */
    function faceDownAsync(): Promise<void>;
    /**
     * Makes the robot face west.
     */
    function faceLeftAsync(): Promise<void>;
    /**
     * Makes the robot face east.
     */
    function faceRightAsync(): Promise<void>;
    /**
     * Returns true if there is wall directly in front of the robot, and false otherwise.
     */
    function wallAhead(level: number): boolean;
}
declare namespace pxsim {
    interface ISimMessage {
        type: "simulator.message";
        key?: string;
        data?: string;
    }
    /**
     * Gets the current 'board', eg. program state.
     */
    function board(): Board;
    /**
     * Represents the entire state of the executing program.
     * Do not store state anywhere else!
     */
    class Board extends pxsim.BaseBoard {
        robot: Phaser.Sprite;
        bus: EventBus;
        game: Phaser.Game;
        stateText: Phaser.Text;
        cursors: Phaser.CursorKeys;
        spaceKey: any;
        levelCount: number;
        stepCount: number;
        highestLevelReached: number;
        RanAllLevels: number;
        updateCounter: number;
        pauseUpdate: boolean;
        wall_ahead: any;
        count: number;
        map: any;
        layer: any;
        robotStartingX: any;
        robotStartingY: any;
        terminalX: any;
        terminalY: any;
        robotStartingDirection: any;
        robotX: any;
        robotY: any;
        robotDirection: any;
        results: any;
        blockLimit: number;
        currAnimatedLevel: number;
        actionLog: any;
        xHistory: any;
        yHistory: any;
        tweenChain: Phaser.Tween[];
        walkSpeed: number;
        turnSpeed: number;
        tweenChainRunning: boolean;
        flipFlop_l: boolean;
        flipFlop_r: boolean;
        flipFlop_u: boolean;
        flipFlop_d: boolean;
        flipFlop_move: boolean;
        button1: HTMLInputElement;
        button2: HTMLInputElement;
        button3: HTMLInputElement;
        button4: HTMLInputElement;
        button5: HTMLInputElement;
        button6: HTMLInputElement;
        button7: HTMLInputElement;
        contentDiv: HTMLDivElement;
        levelMatrix: any;
        constructor();
        initAsync(msg: pxsim.SimulatorRunMessage): Promise<void>;
        preload(): void;
        create(): void;
        update(): void;
        reset(): void;
        updateLevelState(): void;
        changeIcon(level: number): void;
        triggerButtonClick(level: number): void;
        animateLevelForButton(level: number, animateNextLevelIfWon: boolean): void;
        animateAllLevels(startingLevel: number): void;
        animateLevel(level: number, animateNextLevelIfWon: boolean): void;
        nextLevel(): void;
        doNothing(): void;
        buildTweenChain(level: number): void;
        startTweenChain(): void;
        faceLeft(): void;
        faceRight(): void;
        faceUp(): void;
        faceDown(): void;
        wallAheadforAPI(): boolean;
        wallAhead(level: number): boolean;
        moveForward(): void;
        turnLeft(): void;
        turnRight(): void;
        printLevel(level: number): void;
        logAction(action: string, level: number): void;
        capitalizeFirstLetter(str: string): string;
        printSomething(strArray: number[][]): void;
        triggerBFS(): void;
        getLevelPositionHistory(path: any, level: number): void;
        getLevelActionLog(path: any): string[];
        BFS(level: number): number[][];
    }
}
