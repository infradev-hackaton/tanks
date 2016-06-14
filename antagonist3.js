import Unit from './unit';

class Antagonist3 extends Unit {
    constructor() {
        super(...arguments);

        this._health = 100;
        this._damage = 5;
        this._maxSpeed = 10;
    }
}

export default Antagonist3;
