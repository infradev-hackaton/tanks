import Unit from './unit';
import Motion from './motion';
import Shooting from './shooting';
import Engine from './engine';

const BACK_SPEED = 0.75;
const TURN_SPEED = 0.25;

class Turning extends Motion {

    constructor(tank, params) {
        super(params);

        this._tank = tank;
        this.on('move', this._onMove);
    }

    reset() {
        return super.reset().setBackward(false);
    }

    setBackward(backward) {
        this.params.backward = Boolean(backward);
        return this;
    }

    getBackward() {
        return this.params.backward;
    }

    getCurSpeed() {
        const tank = this._tank;
        const tankAbsCurSpeed = Math.abs(tank.getCurSpeed());
        const tankAbsMaxSpeed = Math.abs(tank.getMaxSpeed());
        const curSpeed = super.getCurSpeed() * (0.5 + 0.5 * (tankAbsMaxSpeed - tankAbsCurSpeed) / tankAbsMaxSpeed);

        return (curSpeed - 2 * curSpeed * this.getBackward());
    }

    getMaxSpeed() {
        return this._tank.getMaxSpeed() * TURN_SPEED;
    }

    _onMove(obj) {
        const {moved} = obj;

        this._tank.turn(moved - 2 * moved * this._tank.getBackward());
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            backward: false
        }, params));
    }

}

class Tank extends Unit {

    constructor(...args) {
        super(...args);

        this.engine = new Engine({maxDelta: 1000});
        this.turning = new Turning(this, {});
        this.shooting = new Shooting(this, {});

        this.on('move', obj => this.move(obj.moved));

        super.start();
    }

    getMaxSpeed() {
        return super.getMaxSpeed() * this.getBackFact();
    }

    getCurSpeed() {
        return super.getCurSpeed() * this.engine.getCurPower();
    }

    getBackFact() {
        return BACK_SPEED + ((1 - BACK_SPEED) * !this.engine.isBackwards());
    }

    start() {
        this.engine.start();

        return this;
    }

    pause() {
        this.engine.pause();

        return this;
    }

    reset() {
        return super.reset().setBackward(false);
    }

    setBackward(backward) {
        this.engine.setBackward(backward);

        return this;
    }

    getBackward() {
        return this.engine.getBackward();
    }

    pauseAll() {
        super.pauseAll();

        this.turning.pause();
        this.shooting.pause();

        return this;
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            backward: false,
            maxSpeed: 10
        }, params));
    }

}

export default Tank;
