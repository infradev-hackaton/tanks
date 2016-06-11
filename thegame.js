/**
 * @class TheGame
 *
 * @param {Object} params
 * @param {Number} params.size
 * @param {Number} params.unitsCount
 * */
function TheGame(params) {
    this._bf = [];
    this._positions = {};
    this.params = Object(params);
    this._paused = true;
    this._heroId = null;
    this._playFrameId = 0;
    this.init();
}

TheGame.prototype.isPaused = function () {
    return this._paused;
};

TheGame.prototype.fitPos = function (pos) {
    if (pos < 0) {
        return 0;
    }

    var lastPos = this._bf.length - 1;

    if (pos > lastPos) {
        return lastPos;
    }

    return pos;
};

TheGame.prototype.init = function () {
    var bf = this._bf;
    var size = this.params.size;
    var hero = new Protagonist(this);

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
};

TheGame.prototype.getHero = function () {
    return this._bf[this._positions[this._heroId]];
};

TheGame.prototype.each = function (fn, ctx) {
    var bf = this._bf;
    var i = 0;
    var l = bf.length;

    for (; i < l; i += 1) {
        if (fn.call(ctx, bf[i], i, bf) === false) {
            return false;
        }
    }

    return true;
};

TheGame.prototype.eachUnit = function (fn, ctx) {
    Object.keys(this._positions).forEach(function (id) {
        var pos = this._positions[id];
        fn.call(ctx, this._bf[pos], pos, this._bf);
    }, this);
};

TheGame.prototype.stop = function () {
    if (this.isPaused()) {
        return false;
    }

    this.eachUnit(function (unit) {
        unit.stopMoving();
    });

    this._paused = true;
    TheGame.stopFrame(this._playFrameId);

    return true;
};

TheGame.prototype.start = function () {
    var that = this;

    if (!this.isPaused()) {
        return false;
    }

    this.eachUnit(function (unit) {
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
};

TheGame.prototype.countUnits = function () {
    return Object.keys(this._positions).length;
};

TheGame.prototype.createRandomAntagonist = function () {
    var Class = antagonists[ri(0, antagonists.length - 1)];
    return new Class(this);
};

TheGame.prototype.addRandomAntagonist = function () {
    var pos = Math.round(Math.random()) * this._bf.length - 1;
    var unit = this.createRandomAntagonist();

    this.takePos(pos, unit);
    unit.setDirection(pos < this.getPos(this.getHero()));

    if (!this.isPaused()) {
        unit.startMoving()
    }
};

(function () {
    var stack = [];

    TheGame.pushFrame = function (func) {
        var frame = {
            id: Math.random() * Math.random(),
            fn: func
        };

        if (stack.push(frame) === 1) {
            setTimeout(function () {
                var i = 0;
                var frames = stack;
                var l = frames.length;
                var fn;

                stack = [];

                for (; i < l; i += 1) {
                    fn = frames[i].fn;
                    fn();
                }
            }, 0);
        }

        return frame.id;

    };

    TheGame.stopFrame = function (id) {
        var l = stack.length;
        while (l) {
            l -= 1;
            if (stack[l].id === id) {
                stack.splice(l, 1);
            }
        }
    };
}());

TheGame.prototype.delUnit = function (unit) {
    unit.stopMoving();
    this._takePos(this.getPos(unit), null);
};

TheGame.prototype.getPos = function (unit) {

    if (!(unit instanceof Unit)) {
        return -1;
    }

    var pos = this._positions[unit.id];

    if (typeof pos === 'number') {
        return pos;
    }

    return -1;
};

TheGame.prototype._takePos = function (pos, obj) {
    if (pos > -1 && pos < this._bf.length) {
        if (this._bf[pos] instanceof Unit) {
            delete this._positions[this._bf[pos].id];
        }

        this._bf[pos] = obj;

        if (obj instanceof Unit) {
            this._positions[obj.id] = pos;
        }
    }
};

TheGame.prototype.takePos = function (existingPos, currentUnit) {
    var existingUnit = this._bf[existingPos];

    if (existingUnit instanceof Unit) {
        var units = [existingUnit, currentUnit];
        var i = currentUnit.getCurrentSpeed() > existingUnit.getCurrentSpeed();

        i = Number(i);

        while (existingUnit.isAlive() && currentUnit.isAlive()) {
            var first = units[i];
            var last = units[Number(!Boolean(i))];

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
};

/**
 * @class Unit
 * */
function Unit(game) {
    this.id = String(Math.random() * Math.random());
    this._game = game;
    this._health = 0;
    this._damage = 0;
    this._direction = true;
    this._maxSpeed = 0; // pos/sec
    this._moving = false;
    this._moveFrameId = 0;
}

Unit.prototype.getMaxSpeed = function () {
    return this._maxSpeed;
};

Unit.prototype.getCurrentSpeed = function () {
    return this.getMaxSpeed() * this._moving;
};

Unit.prototype.startMoving = function () {
    var that = this;
    var start = Date.now();

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

        var now = Date.now();
        var time = now - start;
        var maxSpeed = that.getMaxSpeed();
        var steps = maxSpeed / 1000 * time;

        that._moveFrameId = TheGame.pushFrame(moveFrame);

        if (steps > 1) {
            start = now - (time % (1000 / maxSpeed));
            that.moveForward(Math.floor(steps));
        }
    }());

    return true;
};

Unit.prototype.stopMoving = function () {
    this._moving = false;
    TheGame.stopFrame(this._moveFrameId);
};

Unit.prototype.takePos = function (pos) {
    this._game.takePos(pos, this);
};

Unit.prototype.getCurrentPos = function () {
    return this._game.getPos(this);
};

Unit.prototype.getForwardPos = function (pos, offset) {
    if (this.getDirection()) {
        return this._game.fitPos(pos + offset);
    }

    return this._game.fitPos(pos - offset);
};

Unit.prototype.moveForward = function (steps) {
    while (steps) {
        steps -= 1;

        var currentPos = this.getCurrentPos();
        var forwardPos = this.getForwardPos(currentPos, 1);

        if (currentPos === forwardPos) {
            // support ranges
            return false;
        }

        this.takePos(forwardPos);
    }

    return true;
};

Unit.prototype.getDirection = function () {
    return this._direction;
};

Unit.prototype.setDirection = function (d) {
    this._direction = d;
    return this;
};

Unit.prototype.getDamage = function () {
    return this._damage;
};

Unit.prototype.isAlive = function () {
    return this._health > 0;
};

Unit.prototype.decHealth = function (value) {
    this._health -= value;
    if (!this.isAlive()) {
        this.stopMoving();
    }
};

function Bullet() {
    Unit.apply(this, arguments);
    this._damage = 10;
    this._health = 1;
    this._maxSpeed = 100;

    this._range = 100;
    this._movedSteps = 0;
}

Bullet.prototype = Object.create(Unit.prototype);

Bullet.prototype.constructor = Bullet;

Bullet.prototype.moveForward = function (steps) {
    var res = Unit.prototype.moveForward.apply(this, arguments);

    this._movedSteps += Math.abs(steps);

    if (this._movedSteps >= this._range || !res) {
        this._game.delUnit(this);
        return false;
    }

    return res;
};

/**
 * @class Protagonist
 * @extends Unit
 * */
function Protagonist() {
    Unit.apply(this, arguments);
    this._health = 100;
    this._damage = 10;
    this._maxSpeed = 50;

    this._fireSpeed = 5;
    this._fireing = false;
    this._fireFrameId = 0;
}

Protagonist.prototype = Object.create(Unit.prototype);

Protagonist.prototype.constructor = Protagonist;

Protagonist.prototype.startFire = function () {
    var that = this;
    var start = Date.now();

    if (this._fireing) {
        return false;
    }

    this._fireing = true;

    (function fireFrame() {
        if (!that._fireing) {
            return;
        }

        if (!that.isAlive()) {
            that.stopFire();
            return;
        }

        var now = Date.now();
        var time = now - start;
        var shots = that._fireSpeed / 1000 * time;

        that._fireFrameId = TheGame.pushFrame(fireFrame);

        if (shots > 1) {
            start = now - (time % (1000 / that._fireSpeed));
            that.fire();
        }
    })();

    that.fire();

    return true;
};

Protagonist.prototype.stopFire = function () {
    this._fireing = false;
    TheGame.stopFrame(this._fireFrameId);
};

Protagonist.prototype.fire = function () {
    var bullet = new Bullet(this._game);
    var currentPos = this.getCurrentPos();
    var forwardPos = this.getForwardPos(currentPos, 1);

    bullet.setDirection(this.getDirection()); // same direction
    bullet.takePos(forwardPos); // position + 1

    var bulletOffset = bullet.getForwardPos(forwardPos, Math.round(Math.sqrt(bullet.getMaxSpeed()))) - forwardPos;

    bullet.moveForward(Math.abs(bulletOffset));

    bullet.startMoving();
};

function Antagonist1() {
    Unit.apply(this, arguments);
    this._health = 10;
    this._damage = 10;
    this._maxSpeed = 20;
}

Antagonist1.prototype = Object.create(Unit.prototype);

Antagonist1.prototype.constructor = Antagonist1;

function Antagonist2() {
    Unit.apply(this, arguments);
    this._health = 20;
    this._damage = 15;
    this._maxSpeed = 30;
}

Antagonist2.prototype = Object.create(Unit.prototype);

Antagonist2.prototype.constructor = Antagonist2;

function Antagonist3() {
    Unit.apply(this, arguments);
    this._health = 100;
    this._damage = 5;
    this._maxSpeed = 10;
}

Antagonist3.prototype = Object.create(Unit.prototype);

Antagonist3.prototype.constructor = Antagonist3;

function Antagonist4() {
    Unit.apply(this, arguments);
    this._health = 20;
    this._damage = 50;
    this._maxSpeed = 60;
}

Antagonist4.prototype = Object.create(Unit.prototype);

Antagonist4.prototype.constructor = Antagonist4;

function Antagonist5() {
    Unit.apply(this, arguments);
    this._health = 50;
    this._damage = 75;
    this._maxSpeed = 40;
}

Antagonist5.prototype = Object.create(Unit.prototype);

Antagonist5.prototype.constructor = Antagonist5;

var antagonists = [
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

function r(from, to) {
    return from + (Math.random() * (to - from));
}

function ri(from, to) {
    return Math.round(r(from, to));
}
