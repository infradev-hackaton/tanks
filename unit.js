import TheGame from './thegame';

class Unit {
    constructor(game) {
        this.id = String(Math.random() * Math.random());
        this._game = game;
        this._health = 0;
        this._damage = 0;
        this._direction = ['t', 'r', 'b', 'l'];
        this._maxSpeed = 0; // pos/sec
        this._moving = false;
        this._moveFrameId = 0;
    }

    getMaxSpeed() {
        return this._maxSpeed;
    }

    getCurrentSpeed() {
        return this.getMaxSpeed() * this._moving;
    }

    startMoving() {
        let that = this;
        let start = Date.now();

        if (this._moving) {
            return false;
        }

        that._moving = true;

        (function moveFrame() {
            if (!that._moving) {
                return;
            }

            if (!that.isAlive()) {
                that.stopMoving();
                return;
            }

            let now = Date.now();
            let time = now - start;
            let maxSpeed = that.getMaxSpeed();
            let offset = maxSpeed / 1000 * time;

            that._moveFrameId = TheGame.pushFrame(moveFrame);

            if (offset > 1) {
                start = now - (time % (1000 / maxSpeed));
                that.moveForward(Math.floor(offset));
            }
        }());

        return true;
    }

    stopMoving() {
        this._moving = false;
        TheGame.stopFrame(this._moveFrameId);
    }

    takePos(x, y) {
        this._game.takePos(x, y, this);
    }

    getCurrentPos() {
        return this._game.getPos(this);
    }

    getForwardPos(x, y, offset) {
        // TODO if
        switch (this.getDirection()) {
            case 'b':
                return this._game.fitPos(x, y + offset);
            case 't':
                return this._game.fitPos(x, y - offset);
            case 'r':
                return this._game.fitPos(x + offset, y);
            case 'l':
                return this._game.fitPos(x - offset, y);
        }
    }

    moveForward(offset) {
        while (offset) {
            offset -= 1;
            let [curX, curY] = this.getCurrentPos();

            if (curX === -1 || curY === -1) {
                return false;
            }

            let [fwdX, fwdY] = this.getForwardPos(curX, curY, 1);

            if (curX === fwdX && curY === fwdY) {
                // support ranges
                return false;
            }

            this.takePos(fwdX, fwdY);
        }

        return true;
    }

    getDirection() {
        return this._direction[0];
    }

    rotateLeft() {
        this._direction.unshift(this._direction.pop());
    }

    rotateRight() {
        this._direction.push(this._direction.shift());
    }

    setDirection(d) {
        while (d !== this.getDirection()) {
            this.rotateLeft();
        }

        return this;
    }

    getDamage() {
        return this._damage;
    }

    isAlive() {
        return this._health > 0;
    }

    decHealth(value) {
        this._health -= value;
        if (!this.isAlive()) {
            this.stopMoving();
        }
    }
}

export default Unit;
