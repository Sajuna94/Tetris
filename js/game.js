import { showGameOverAnime, showStartAnime } from "./anime.js";
import { Board } from "./board.js";
import { Block } from "./block.js";
import { bindCanvasEvents } from "./event.js";
import { canPlace } from "./check.js";

export const DEFAULT_BLOCKS = [
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
        this.smallBoard = new Board(13, 5, this.size * 5 / 8);

        this.init();
    }

    async init() {
        await showStartAnime(this);
        this.reset();
        bindCanvasEvents(this);
        this.loop();
        this.start();
    }

    reset() {
        // for 5s add block control
        this.fallSpeed = 1000;
        this.tick = 0;

        // game values
        this.colorMap = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
        this.blocks = [];
        this.backupBlocks = Array.from({ length: 4 }, () => this.createBlock());

        this.stop();
        this.draw();
    }

    async loop() {
        var sortedBlocks = [...this.blocks].sort((a, b) => b.y - a.y);

        // mark die block
        sortedBlocks.forEach(block => this.fallBlock(block))
        this.processGameData();
    }
    async processGameData() {
        
        // clear full color row
        let fullRowIndexs = [];
        for (let y = 0; y < this.rows; y++) {
            if (!this.colorMap[y].some(color => color == null))
                fullRowIndexs.push(y);
        }
        fullRowIndexs.forEach(idx => {
            this.colorMap.splice(idx, 1);
            this.colorMap.unshift(Array(this.cols).fill(null));
        })

        // game over
        if (this.colorMap[0].some(color => color != null)) {
            this.stop();
            await showGameOverAnime(this);
            this.reset();
            return;
        }

        // update live blocks
        this.blocks = this.blocks.filter(block => !block.die);

        // add new block
        if (!this.blocks.length) {
            this.tick = 0;
            this.shiftBlock();
        }
        if (this.tick >= 5000) {
            this.tick -= 5000;
            this.shiftBlock();
        }

        // auto focus block
        if (!this.blocks.some((block) => block.focus)) {
            this.blocks[0].focus = true;
        }
        this.draw();

        document.getElementById("tick-box").textContent =
            "Time: " +
            `${Math.floor(this.tick / 1000) % 10}.` +
            `${Math.floor(this.tick / 100) % 10}`;
    }

    fallBlock(block) {
        block.y += 1;

        if (!canPlace(this, block)) {
            block.die = true;
            block.y -= 1;
            block.shape.forEach((row, y) => row.forEach((value, x) => {
                if (block.y + y >= 0 && value)
                    this.colorMap[block.y + y][block.x + x] = block.color;
            }));
        }
    }

    moveFocusBlock(key) {
        if (!this.blocks.length)
            return

        var block = this.blocks.find(block => block.focus);
        var tmpBlock = block.copy();

        switch (key) {
            case 'left': block.x -= 1; break;
            case 'right': block.x += 1; break;
            case 'down': block.y += 1; break;
            case 'rotate':
                if (block.x + block.height >= this.cols)
                    block.x = this.cols - block.height;
                block.rotate();
                break;
            case 'floor':
                while (canPlace(this, block))
                    block.y += 1;
                block.y -= 1;
                this.fallBlock(block);
                this.processGameData();
                break;
        }
        if (!canPlace(this, block)) {
            block.set(tmpBlock);
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

        // test
        var sourceBlock = this.blocks.find(block => block.focus);
        if (sourceBlock) {
            var tmpBlock = sourceBlock.copy();

            tmpBlock.y += tmpBlock.height;
            while (canPlace(this, tmpBlock))
                tmpBlock.y += 1;
            tmpBlock.y -= 1;

            if (tmpBlock.y >= sourceBlock.y + sourceBlock.height)
                this.board.drawAvoidBlock(tmpBlock);
        }
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
        this.fallSpeed /= 2;
        this.start();
    }
    speedDown() {
        this.fallSpeed *= 2;
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
        var newBlock = DEFAULT_BLOCKS[Math.floor(Math.random() * DEFAULT_BLOCKS.length)].copy();
        newBlock.color = this.board.getRandomVividColor();
        return newBlock;
    }
}