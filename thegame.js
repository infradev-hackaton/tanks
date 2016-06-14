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

    fitPos(pos) {
        if (pos < 0) {
            return 0;
        }

        let lastPos = this._bf.length - 1;

        if (pos > lastPos) {
            return lastPos;
        }

        return pos;
    }

    init() {
        let bf = this._bf;
        let size = this.params.size;
        let hero = new Protagonist(this);

        this.stop();

        bf.length = size;

        while (size) {
            size -= 1;
            bf[size] = null;
        }

        this._positions = {};

        size = bf.length;

        this._heroId = hero.id;

        this.takePos(Math.round(size / 2), hero);
    }

    getHero() {
        return this._bf[this._positions[this._heroId]];
    }

    each(fn, ctx) {
        let bf = this._bf;

        for (let i = 0, l = bf.length; i < l; i += 1) {
            if (fn.call(ctx, bf[i], i, bf) === false) {
                return false;
            }
        }

        return true;
    }

    eachUnit(fn, ctx) {
        Object.keys(this._positions).forEach((id) => {
            let pos = this._positions[id];
            fn.call(ctx, this._bf[pos], pos, this._bf);
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

        this.eachUnit((unit) => {
            unit.startMoving();
        });

        this._paused = false;

        (function playFrame() {
            if (that.isPaused()) {
                return;
            }

            if (that.countUnits() < that.params.unitsCount) {
                that.addRandomAntagonist();
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
        let pos = Math.round(Math.random()) * this._bf.length - 1;
        let unit = this.createRandomAntagonist();

        this.takePos(pos, unit);
        unit.setDirection(pos < this.getPos(this.getHero()));

        if (!this.isPaused()) {
            unit.startMoving()
        }
    }

    delUnit(unit) {
        unit.stopMoving();
        this._takePos(this.getPos(unit), null);
    }

    getPos(unit) {
        if (!(unit instanceof Unit)) {
            return -1;
        }

        let pos = this._positions[unit.id];

        if (typeof pos === 'number') {
            return pos;
        }

        return -1;
    }

    takePos(existingPos, currentUnit) {
        let existingUnit = this._bf[existingPos];

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

        this._takePos(this.getPos(currentUnit), null);

        if (currentUnit.isAlive()) {
            this._takePos(existingPos, currentUnit);
        }
    }

    _takePos(pos, obj) {
        if (pos > -1 && pos < this._bf.length) {
            if (this._bf[pos] instanceof Unit) {
                delete this._positions[this._bf[pos].id];
            }

            this._bf[pos] = obj;

            if (obj instanceof Unit) {
                this._positions[obj.id] = pos;
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
