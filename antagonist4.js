import Unit from './unit';

class Antagonist4 extends Unit {
    constructor() {
        super(...arguments);

        this._health = 20;
        this._damage = 50;
        this._maxSpeed = 60;
    }
}

export default Antagonist4;
