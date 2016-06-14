import Unit from './unit';

class Bullet extends Unit {
    constructor() {
        super(...arguments);

        this._damage = 10;
        this._health = 1;
        this._maxSpeed = 100;

        this._range = 100;
        this._movedSteps = 0;
    }

    moveForward(steps) {
        let res = super.moveForward(...arguments);

        this._movedSteps += Math.abs(steps);

        if (this._movedSteps >= this._range || !res) {
            this._game.delUnit(this);
            return false;
        }

        return res;
    }
}

export default Bullet;
