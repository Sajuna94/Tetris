import { showGameOverAnime, showStartAnime } from "./anime.js";
import { Board } from "./board.js";
import { Block } from "./block.js";
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

        // anime
        this.isAnimating = false;

        this.reset();
    }

    async reset() {
        // for 5s add block control
        this.fallSpeed = 1000;
        this.tick = 0;

        // game values
        this.colorMap = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
        this.blocks = [];
        this.backupBlocks = Array.from({ length: 4 }, () => this.createBlock());

        await showStartAnime(this);
        // 解決顯示時序問題 先loop一次
        this.loop();
        this.start();
        this.display();
    }

    loop() {
        this.blocks = this.blocks.sort((a, b) => b.y - a.y);

        // mark die block
        this.blocks.forEach(block => this.fallDownBlock(block))
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

        // update live blocks
        this.blocks = this.blocks.filter(block => !block.die);
        this.display();

        // game over
        if (this.colorMap[0].some(color => color != null)) {
            await showGameOverAnime(this);
            this.reset();
            return;
        }

        // add new block
        if (!this.blocks.length) {
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
    }

    fallDownBlock(block) {
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
                this.fallDownBlock(block);
                this.processGameData();
                break;
            case 'up': block.y -= 1; break;
        }
        if (!canPlace(this, block)) {
            block.set(tmpBlock);
        }
        this.display();
    }

    // draw everything
    display() {
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

        // tick text
        document.getElementById("tick-box").textContent =
            "Time: " +
            `${Math.floor(this.tick / 1000) % 10}.` +
            `${Math.floor(this.tick / 100) % 10}`;
    }


    // start & stop control
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