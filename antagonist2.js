import Unit from './unit';

class Antagonist2 extends Unit {
    constructor() {
        super(...arguments);

        this._health = 20;
        this._damage = 15;
        this._maxSpeed = 30;
    }
}

export default Antagonist2;
