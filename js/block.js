export class Block {
    constructor(shape, x = 0, y = 0) {
        this.shape = shape;
        this.width = shape[0].length;
        this.height = shape.length;
        this.x = x;
        this.y = y;

        this.color = "red";
        this.focus = false;
        this.die = false;
    }

    rotate() {
        [this.width, this.height] = [this.height, this.width];
        this.shape = this.shape[0].map((_, index) => this.shape.map(row => row[index]).reverse());
    }

    contains(x, y) {
        return !(
            x < this.x || this.x + this.width <= x ||
            y < this.y || this.y + this.height <= y
        );
    }

    set(obj) {
        Object.assign(this, obj);
    }

    copy() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}