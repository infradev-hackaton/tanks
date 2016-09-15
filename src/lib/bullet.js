import Unit from './unit';

class Bullet extends Unit {

    constructor(...args) {
        super(...args);

        this.on('move', this._onMove);
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            maxSpeed: 100,
            maxRange: Infinity
        }, params));
    }

    _onMove(obj) {
        const {maxRange} = this.params;
        let {moved, total} = obj;

        if (total > maxRange) {
            moved -= total - maxRange;
            this.pause();
        }

        if (!this.move(moved)) {
            this.pause();
        }

        if (!this.isRunning()) {
            this.getGame().delUnit(this);
        }
    }

}

export default Bullet;
