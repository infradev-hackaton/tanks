import Unit from './unit';

class Antagonist1 extends Unit {
    constructor() {
        super(...arguments);

        this._health = 10;
        this._damage = 10;
        this._maxSpeed = 20;
    }
}

export default Antagonist1;
