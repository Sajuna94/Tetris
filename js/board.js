const MY_COLOR = {
    BACK_GROUND: "#111111",
    // BORDER: "#1f1f1f",
    BOX: "#111111",
    BORDER: "#333333cc"
}

export class Board {
    constructor(rows, cols, size) {
        this.rows = rows;
        this.cols = cols;
        this.size = size;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = cols * size;
        this.canvas.height = rows * size;
        this.canvas.style.border = "3px solid black";
        this.canvas.style.backgroundColor = MY_COLOR.BOX;
    }

    drawBox(x, y, color = MY_COLOR.BOX) {
        let dx = x * this.size;
        let dy = y * this.size;

        // fill box of color style
        this.ctx.fillStyle = color;
        this.ctx.fillRect(dx, dy, this.size, this.size);

        // draw box border

        this.ctx.strokeStyle = MY_COLOR.BORDER;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(dx, dy, this.size, this.size);
    }

    drawGird() {
        for (let y = 0; y < this.rows; y++)
            for (let x = 0; x < this.cols; x++) {
                this.drawBox(x, y);
            }
    }

    drawBlock(block) {
        block.shape.forEach((row, y) => row.forEach((val, x) => {
            if (!val) return;

            let dx = x + block.x;
            let dy = y + block.y;
            this.drawBox(dx, dy, this.getGrd(dx, dy, block.color));
        }));
    }

    drawBlockBorder(block) {
        let dx = block.x * this.size - 2;
        let dy = block.y * this.size - 2;
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "red";
        this.ctx.strokeRect(dx, dy, block.width * this.size + 4, block.height * this.size + 4);
    }

    drawColorMap(map) {
        map.forEach((row, y) => row.forEach((color, x) => {
            if (color) this.drawBox(x, y, this.getGrd(x, y, color));
        }));
    }

    getGrd(x, y, color) {
        // grd compute value
        let dx = x * this.size;
        let dy = y * this.size;
        let add = this.size * 0.2;
        // create grd style
        var grd = this.ctx.createRadialGradient(
            dx + add, dy + add, this.size * 0.08,
            dx + add, dy + add, this.size * 0.38
        );
        grd.addColorStop(0, "#ffffff");
        grd.addColorStop(1, color);

        return grd;
    }

    getRandomVividColor() {
        let hue = Math.floor(Math.random() * 360);
        let saturation = 90;
        let lightness = 40;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}