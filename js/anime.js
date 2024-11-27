import { Block } from "./block.js";

const numberBlock = {
    ZERO: new Block([ // 0
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
    ]),
    TWO: new Block([ // 2
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
    ]),
    FOUR: new Block([ // 4
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1],
    ]),
};

export async function showStartAnime(game) {
    const content = {
        blocks: [ // 2024
            numberBlock.TWO.copy(),
            numberBlock.ZERO.copy(),
            numberBlock.TWO.copy(),
            numberBlock.FOUR.copy(),
        ],
        length: game.cols + 1,
    }

    // set content value
    content.blocks.forEach(block => {
        block.y = (game.rows - block.height - 1) / 2;
        block.x = content.length;
        block.color = "#cfcfcf";
        content.length += block.width + 1;
    });

    // start show anime
    console.log("[start anime] start");

    for (let i = 0; i < content.length; i++) {
        game.board.drawGird();
        content.blocks.forEach(block => {
            block.x -= 1;
            game.board.drawBlock(block);
        });
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log("[start anime] end");
}

export async function showGameOverAnime(game) {
    console.log("[gameover anime] start");

    for (let y = 0; y < game.rows; y++)
        for (let x = 0; x < game.cols; x++) {
            await new Promise(resolve => setTimeout(resolve, 10));
            game.board.drawBox(x, y, "white");
        }
    await new Promise(resolve => setTimeout(resolve, 500));
    game.board.drawGird();

    console.log("[gameover anime] end");
}