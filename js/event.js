import { canPlace } from "./check.js";
import { Game } from "./game.js";

export function bindCanvasEvents(game) {
    if (!(game instanceof Game))
        return;

    var dragBlock = null;
    let mouseDownPt = null, blockOffsetPt = null;

    // get drag block when mouse select the block on canvas
    game.board.canvas.addEventListener('mousedown', event => {
        let gridPt = getGridPoint(event, game.size);
        const block = game.blocks.find((block) =>
            block.contains(gridPt.x, gridPt.y) &&
            block.shape[gridPt.y - block.y][gridPt.x - block.x]
        );

        game.board.drawBox(gridPt.x, gridPt.y, "white");

        if (block) {
            dragBlock = block;
            mouseDownPt = gridPt;
            blockOffsetPt = { x: gridPt.x - block.x, y: gridPt.y - block.y };
        }
    });
    // if next block position can place then move the drag block
    game.board.canvas.addEventListener('mousemove', event => {
        if (!dragBlock || !dragBlock.focus) return;

        let gridPt = getGridPoint(event, game.size);
        var tmpBlock = dragBlock.copy();

        dragBlock.x = gridPt.x - blockOffsetPt.x;
        dragBlock.y = gridPt.y - blockOffsetPt.y;

        // if not reset drag block
        if (!canPlace(game, dragBlock)) {
            dragBlock.set(tmpBlock);
        }
        game.draw();
    });
    // if drag block defined set game current block
    game.board.canvas.addEventListener('mouseup', () => {
        if (!dragBlock) return;

        let gridPt = getGridPoint(event, game.size);

        if (gridPt.x == mouseDownPt.x && gridPt.y == mouseDownPt.y) {
            if (!dragBlock.focus)
                game.blocks.forEach((block) => block.focus = false);
            dragBlock.focus = !dragBlock.focus;
        }
        dragBlock = null;
        game.draw();
    });
    // clear drag block when mouse leaves the canvas
    game.board.canvas.addEventListener('mouseleave', () => {
        dragBlock = null;
    });
}

function getGridPoint(event, size) {
    return {
        x: Math.floor(event.offsetX / size),
        y: Math.floor(event.offsetY / size),
    }
}