import Unit from './unit';

class Antagonist5 extends Unit {
    constructor() {
        super(...arguments);

        this._health = 50;
        this._damage = 75;
        this._maxSpeed = 40;
    }
}

export default Antagonist5;
