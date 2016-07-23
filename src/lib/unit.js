import Motion from './motion';

const DIRS = [0, 0, 0, 0];

class Unit extends Motion {

    constructor(game, params) {
        super(params);

        this.id = String(Math.random() * Math.random());
        this._game = game;

        this._dirs = DIRS.map((v, i) => i * (360 / DIRS.length));
    }

    getGame() {
        return this._game;
    }

    setPos(x, y) {
        this._game.setPos(x, y, this);

        return this;
    }

    getPos() {
        return this._game.getPos(this);
    }

    calcPos(x, y, offset) {
        const d = this.getDirection();

        if (d < 90) {
            return this._game.fitPos(x, y - offset);
        }

        if (d < 180) {
            return this._game.fitPos(x + offset, y);
        }

        if (d < 270) {
            return this._game.fitPos(x, y + offset);
        }

        return this._game.fitPos(x - offset, y);
    }

    move(offset) {
        const step = 1 + -2 * (offset < 0);
        let absOffset = Math.abs(offset);

        while (absOffset) {
            absOffset -= 1;

            const [curX, curY] = this.getPos();

            if (curX === -1 || curY === -1) {
                return false;
            }

            let [fwdX, fwdY] = this.calcPos(curX, curY, step);

            if (curX === fwdX && curY === fwdY) {
                // support ranges
                return false;
            }

            this.setPos(fwdX, fwdY);
        }

        return true;
    }

    turn(angles) {
        let dirs = this._dirs;

        angles %= dirs.length; // support more than 360deg rotates

        dirs = dirs.slice(angles).concat(dirs.slice(0, angles));

        this._dirs = dirs;
    }

    getDirection() {
        return this._dirs[0];
    }

    setDirection(d) {
        while (d !== this.getDirection()) {
            this.turn(1);
        }

        return this;
    }

    pauseAll() {
        return this.pause();
    }

}

export default Unit;
