import { showGameOverAnime, showStartAnime } from "./anime.js";
import { Board } from "./board.js";
import { Block } from "./block.js";
import { bindCanvasEvents } from "./event.js";
import { canPlace } from "./check.js";

export const defaultBlocks = [
    new Block([
        [1, 1],
        [1, 1]
    ]),
    new Block([
        [1, 1, 1, 1]
    ]),
    new Block([
        [1, 1, 1],
        [0, 1, 0]
    ]),
    new Block([
        [0, 1],
        [1, 1],
        [1, 0]
    ]),
    new Block([
        [0, 1],
        [0, 1],
        [1, 1],
    ]),
];

export class Game {
    constructor() {
        this.rows = 20;
        this.cols = 10;
        this.size = 30;

        // game board
        this.board = new Board(this.rows, this.cols, this.size);
        this.smallBoard = new Board(13, 5, this.size);

        this.init();
    }

    async init() {
        // await showStartAnime(this);
        this.reset();
        bindCanvasEvents(this);

        this.start();
    }

    reset() {
        // for 5s add block control
        this.fallSpeed = 1000;
        this.tick = 0;

        // game values
        this.colorMap = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
        // for (let x = 0; x < this.cols; x++) {
        //     this.colorMap[3][x] = "black";
        // }
        this.blocks = [];
        this.backupBlocks = Array.from({ length: 3 }, () => this.createBlock());

        this.stop();
    }

    async loop() {
        var sortedBlocks = [...this.blocks].sort((a, b) => b.y - a.y);
        this.blocks = [];

        // move down all block and check blcok live
        sortedBlocks.forEach(async block => {
            var tmpBlock = block.copy();
            block.y += 1;

            // block live
            if (canPlace(this, block)) {
                this.blocks.push(block);
            }
            // block die
            else {
                // set die block color of colorMap
                tmpBlock.shape.forEach((row, y) => row.forEach((value, x) => {
                    if (tmpBlock.y + y >= 0 && value)
                        this.colorMap[tmpBlock.y + y][tmpBlock.x + x] = tmpBlock.color;
                }));
                if (tmpBlock.y <= 0) {
                    // GAME OVER
                    this.stop();
                    await showGameOverAnime(this);
                    this.reset();
                    this.start();
                    return;
                }
            }
        });

        // add new block
        if (!this.blocks.length || this.tick >= 5000) {
            this.tick -= 5000;
            this.shiftBlock();
        }
        // auto focus block
        if (!this.blocks.some((block) => block.focus)) {
            this.blocks[0].focus = true;
        }

        this.draw();
    }

    // draw everything
    draw() {
        // main board
        this.board.drawGird();
        this.blocks.forEach(block => this.board.drawBlock(block));
        this.blocks.forEach(block => { if (block.focus) this.board.drawBlockBorder(block) });
        this.board.drawColorMap(this.colorMap);

        // small board
        this.smallBoard.ctx.clearRect(0, 0, this.smallBoard.canvas.width, this.smallBoard.canvas.height);
        let y = 1;
        this.backupBlocks.forEach(block => {
            block.y = y;
            block.x = (this.smallBoard.cols - block.width) / 2;
            y += block.height + 1;
            this.smallBoard.drawBlock(block);
        });
    }

    // start / stop control
    stop() {
        clearInterval(this.interval);
    }
    start() {
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.tick += this.fallSpeed;
            this.loop();
        }, this.fallSpeed);
    }

    // speed control
    speedUp() {
        this.fallSpeed /= 1.2;
        this.start();
    }
    speedDown() {
        this.fallSpeed *= 1.2;
        this.start();
    }

    // for small board block move to main board
    shiftBlock() {
        this.backupBlocks.push(this.createBlock());

        var newBlock = this.backupBlocks.shift();
        newBlock.x = Math.floor(Math.random() * (this.cols - newBlock.width + 1));
        newBlock.y = -newBlock.height;

        this.blocks.push(newBlock);
    }
    createBlock() {
        var newBlock = defaultBlocks[Math.floor(Math.random() * defaultBlocks.length)].copy();
        newBlock.color = this.board.getRandomVividColor();
        return newBlock;
    }
}