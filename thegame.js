import Protagonist from './protagonist';
import Unit from './unit';
import Antagonist1 from './antagonist1';
import Antagonist2 from './antagonist2';
import Antagonist3 from './antagonist3';
import Antagonist4 from './antagonist4';
import Antagonist5 from './antagonist5';

let stack = [];
let antagonists = [
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist1,
    Antagonist2,
    Antagonist2,
    Antagonist2,
    Antagonist2,
    Antagonist3,
    Antagonist3,
    Antagonist4,
    Antagonist4,
    Antagonist5
];

class TheGame {
    /**
     * @param {Object} params
     * @param {Number} params.size
     * @param {Number} params.unitsCount
     * */
    constructor(params) {
        this._bf = [];
        this._positions = {};
        this.params = Object(params);
        this._paused = true;
        this._heroId = null;
        this._playFrameId = 0;
        this.init();
    }

    isPaused() {
        return this._paused;
    }

    fitPos(x, y) {

        if (x < 0) {
            x = 0;
        } else {
            let maxX = this.params.w - 1;

            if (x > maxX) {
                x = maxX;
            }
        }

        if (y < 0) {
            y = 0;
        } else {
            let maxY = this.params.h - 1;

            if (y > maxY) {
                y = maxY;
            }
        }

        return [x, y];
    }

    init() {
        let sizeH = this.params.h;
        let hero = new Protagonist(this);

        this.stop();

        this._bf.length = sizeH;

        while (sizeH) {
            sizeH -= 1;
            this._bf[sizeH] = new Array(this.params.w);
            let sizeW = this.params.w;

            while (sizeW) {
                sizeW -= 1;
                this._bf[sizeH][sizeW] = null;
            }
        }

        this._positions = {};

        this._heroId = hero.id;

        this.takePos(Math.round(this.params.w / 2), Math.round(this.params.h / 2), hero);
    }

    getHero() {
        let xy = this._positions[this._heroId];

        if (Array.isArray(xy)) {
            let [x, y] = xy;
            return this._bf[y][x];
        }

        return null;
    }

    each(fn, ctx) {
        let bf = this._bf;

        for (let y = 0, h = bf.length; y < h; y += 1) {
            for (let x = 0, w = bf[y].length; x < w; x += 1) {
                if (fn.call(ctx, bf[y][x], x, y, bf) === false) {
                    return false;
                }
            }
        }

        return true;
    }

    eachUnit(fn, ctx) {
        Object.keys(this._positions).forEach((id) => {
            let [x, y] = this._positions[id];
            fn.call(ctx, this._bf[y][x], x, y, this._bf);
        });
    }

    stop() {
        if (this.isPaused()) {
            return false;
        }

        this.eachUnit((unit) => {
            unit.stopMoving();
        });

        this._paused = true;
        TheGame.stopFrame(this._playFrameId);

        return true;
    }

    start() {
        let that = this;

        if (!this.isPaused()) {
            return false;
        }

        // this.eachUnit((unit) => {
        //     unit.startMoving();
        // });

        this._paused = false;

        (function playFrame() {
            if (that.isPaused()) {
                return;
            }

            if (that.countUnits() < that.params.unitsCount) {
                // that.addRandomAntagonist();
            }

            that._playFrameId = TheGame.pushFrame(playFrame);
        })();

        return true;
    }

    countUnits() {
        return Object.keys(this._positions).length;
    }

    createRandomAntagonist() {
        let Class = antagonists[ri(0, antagonists.length - 1)];
        return new Class(this);
    }

    addRandomAntagonist() {
        let randY = Math.round(Math.random()) * this.params.h - 1;
        let randX = Math.round(Math.random()) * this.params.w - 1;

        let unit = this.createRandomAntagonist();

        this.takePos(randX, randY, unit);

        // unit.setDirection(randY < this.getPos(this.getHero()));

        if (!this.isPaused()) {
            unit.startMoving();
        }
    }

    delUnit(unit) {
        unit.stopMoving();
        let [x, y] = this.getPos(unit);
        this._takePos(x, y, null);
    }

    getPos(unit) {
        if (!(unit instanceof Unit)) {
            return [-1, -1];
        }

        let xy = this._positions[unit.id];

        if (Array.isArray(xy)) {
            return xy;
        }

        return [-1, -1];
    }

    takePos(existingX, existingY, currentUnit) {
        let existingUnit = null;

        if (Array.isArray(this._bf[existingY])) {
            existingUnit = this._bf[existingY][existingX];
        }

        if (existingUnit instanceof Unit) {
            let units = [existingUnit, currentUnit];
            let i = currentUnit.getCurrentSpeed() > existingUnit.getCurrentSpeed();

            i = Number(i);

            while (existingUnit.isAlive() && currentUnit.isAlive()) {
                let first = units[i];
                let last = units[Number(!Boolean(i))];

                last.decHealth(first.getDamage()); // decrease target health

                if (last.isAlive()) {
                    first.decHealth(last.getDamage()); // decrease self health
                }

                i = Number(!Boolean(i));
            }
        }

        let [x, y] = this.getPos(currentUnit);

        this._takePos(x, y, null);

        if (currentUnit.isAlive()) {
            this._takePos(existingX, existingY, currentUnit);
        }
    }

    _takePos(x, y, obj) {
        if (x > -1 && x < this.params.w && y > -1 && y < this.params.h) {
            if (this._bf[y][x] instanceof Unit) {
                delete this._positions[this._bf[y][x].id];
            }

            this._bf[y][x] = obj;

            if (obj instanceof Unit) {
                this._positions[obj.id] = [x, y];
            }
        }
    }

    static pushFrame(func) {
        let frame = {
            id: Math.random() * Math.random(),
            fn: func
        };

        if (stack.push(frame) === 1) {
            setTimeout(() => {
                let frames = stack;

                stack = [];

                for (let i = 0, l = frames.length; i < l; i += 1) {
                    let fn = frames[i].fn;
                    fn();
                }
            }, 0);
        }

        return frame.id;
    }

    static stopFrame(id) {
        let l = stack.length;

        while (l) {
            l -= 1;
            if (stack[l].id === id) {
                stack.splice(l, 1);
            }
        }
    }
}

function r(from, to) {
    return from + (Math.random() * (to - from));
}

function ri(from, to) {
    return Math.round(r(from, to));
}

export default TheGame;
