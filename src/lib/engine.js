import Ticker from './ticker';

const BRAKE_SPEED = 0.75;

function r(v, min, max) {
    v = Math.max(v, min);
    v = Math.min(v, max);

    return v;
}

class Engine extends Ticker {

    constructor(params) {
        super(params);

        this._total = 0;

        this.on('tick', this._onTick);

        this._brake = new Ticker()
            .on('tick', obj => this._onBrakeTick(obj));
    }

    start() {
        this._brake.pause();
        return super.start();
    }

    pause() {
        this._brake.start();
        return super.pause();
    }

    reset() {
        this._total = 0;
        return super.reset();
    }

    setBackward(backward) {
        this.params.backward = Boolean(backward);
        return this;
    }

    getBackward() {
        return this.params.backward;
    }

    isBackwards() {
        return this._total < 0;
    }

    getMaxSpeed() {
        let maxSpeed = 1 / this.params.maxDelta * 1000;

        maxSpeed = maxSpeed - 2 * maxSpeed * this.getBackward();

        return maxSpeed;
    }

    getEstTotal() {
        return this._total;
    }

    getCurPower() {
        return Math.sin(this._total);
    }

    _createParams(params) {
        params = super._createParams(Object.assign({
            backward: false,
            maxDelta: 1000
        }, params));

        params.maxDelta = Math.max(params.maxDelta | 0, 1);

        return params;
    }

    _isForceBraking() {
        const estTotal = this.getEstTotal();
        const maxSpeed = this.getMaxSpeed();

        return estTotal > 0 && maxSpeed < 0 || estTotal < 0 && maxSpeed > 0;
    }

    _onBrakeTick(obj) {
        const estTotal = this._total;
        const minTotal = -Math.PI / 2;
        const maxTotal = Math.PI / 2;
        const estDelta = (obj.estDelta / 1000);

        let maxSpeed = this.getMaxSpeed() * BRAKE_SPEED;
        let backward = this.getBackward();

        if (this._isForceBraking()) {
            maxSpeed = -maxSpeed;
            backward = !backward;
        }

        this._total = r(estTotal - maxSpeed * estDelta, minTotal * backward, maxTotal * !backward);
    }

    _onTick(obj) {
        const estDelta = obj.estDelta / 1000;
        const estTotal = this._total;
        const minTotal = -Math.PI / 2;
        const maxTotal = Math.PI / 2;
        let maxSpeed = this.getMaxSpeed();

        maxSpeed += maxSpeed *
            (estTotal / (maxTotal * (maxSpeed < 0) + minTotal * (maxSpeed > 0))) * this._isForceBraking();

        this._total = r(estTotal + maxSpeed * estDelta, minTotal, maxTotal);
    }

}

export default Engine;
