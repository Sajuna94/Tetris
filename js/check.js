export function canPlace(game, block) {
    if (checkOverlapMap(game, block))
        return false;

    if (game.blocks.some(otherBlock => {
        if (block == otherBlock)
            return false;
        return checkOverlapBlock(block, otherBlock);
    })) {
        return false;
    }
    return true;
}

export function checkOverlapMap(game, block) {
    return block.shape.some((row, y) => row.some((val, x) => {
        let dx = x + block.x;
        let dy = y + block.y;

        // over edge line
        if (dx < 0 || dx >= game.cols || dy >= game.rows)
            return true;
        // check inside box of block is overlap color map box
        if (dy >= 0 && val && game.colorMap[dy][dx])
            return true;
        return false;
    }));
}

export function checkOverlapBlock(blockA, blockB) {
    let offsetY = Math.abs(Math.min(blockA.y, blockB.y));

    // create can contain both block map
    var map = Array.from({
        length: Math.max(blockA.y + blockA.height, blockB.y + blockB.height) + offsetY
    }, () => Array(
        Math.max(blockA.x + blockA.width, blockB.x + blockB.width)
    ).fill(0));

    // set blockA value at map
    blockA.shape.forEach((row, y) => row.forEach((value, x) => {
        map[blockA.y + y + offsetY][blockA.x + x] = value;
    }));
    // compare blockB each box of map
    return blockB.shape.some((row, y) => row.some((value, x) => {
        return (map[blockB.y + y + offsetY][blockB.x + x] && value)
    }));
}