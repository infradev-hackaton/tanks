import Ticker from './ticker';

class Motion extends Ticker {

    constructor(params) {
        super(params);
        this._total = 0;

        this.on('tick', this._onTick);
    }

    reset() {
        this._total = 0;
        return super.reset();
    }

    getEstTotal() {
        return this._total;
    }

    getMaxSpeed() {
        return this.params.maxSpeed;
    }

    getCurSpeed() {
        return this.getMaxSpeed();
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            maxSpeed: 1
        }, params));
    }

    _onTick(obj) {
        const prevTotal = this.getEstTotal();
        const nextTotal = prevTotal + this.getCurSpeed() * (obj.estDelta / 1000);
        const moved = (nextTotal | 0) - (prevTotal | 0);

        this._total = nextTotal;

        this.emit('move', {
            total: nextTotal | 0,
            moved: moved
        })
    }

}

export default Motion;
