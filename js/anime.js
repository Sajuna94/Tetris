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
    game.stop();

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
    game.isAnimating = true;
    console.log("[start anime] start");

    game.board.drawGird();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let i = 0; i < content.length; i++) {
        game.board.drawGird();
        content.blocks.forEach(block => {
            block.x -= 1;
            game.board.drawBlock(block);
        });
        await new Promise(resolve => setTimeout(resolve, 100 - i));
    }
    console.log("[start anime] end");
    game.isAnimating = false;
}

export async function showGameOverAnime(game) {
    game.stop();

    game.isAnimating = true;
    console.log("[gameover anime] start");

    for (let y = game.rows - 1; y >= 0; y--)
        for (let x = 0; x < game.cols; x++) {
            await new Promise(resolve => setTimeout(resolve, 10));
            game.board.drawBox(x, y, game.board.getGrd(x, y, "#cccccc"));
        }
    await new Promise(resolve => setTimeout(resolve, 500));
    game.board.drawGird();

    console.log("[gameover anime] end");
    game.isAnimating = false;
}