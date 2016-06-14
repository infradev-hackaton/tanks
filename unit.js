import TheGame from './thegame';

class Unit {
    constructor(game) {
        this.id = String(Math.random() * Math.random());
        this._game = game;
        this._health = 0;
        this._damage = 0;
        this._direction = true;
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
            let steps = maxSpeed / 1000 * time;

            that._moveFrameId = TheGame.pushFrame(moveFrame);

            if (steps > 1) {
                start = now - (time % (1000 / maxSpeed));
                that.moveForward(Math.floor(steps));
            }
        }());

        return true;
    }

    stopMoving() {
        this._moving = false;
        TheGame.stopFrame(this._moveFrameId);
    }

    takePos(pos) {
        this._game.takePos(pos, this);
    }

    getCurrentPos() {
        return this._game.getPos(this);
    }

    getForwardPos(pos, offset) {
        if (this.getDirection()) {
            return this._game.fitPos(pos + offset);
        }

        return this._game.fitPos(pos - offset);
    }

    moveForward(steps) {
        while (steps) {
            steps -= 1;

            let currentPos = this.getCurrentPos();
            let forwardPos = this.getForwardPos(currentPos, 1);

            if (currentPos === forwardPos) {
                // support ranges
                return false;
            }

            this.takePos(forwardPos);
        }

        return true;
    }

    getDirection() {
        return this._direction;
    }

    setDirection(d) {
        this._direction = d;
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
