import Bullet from './bullet';
import Motion from './motion';
import Ticker from './ticker';

class Shooting extends Motion {

    constructor(tank, params) {
        super(params);

        this._tank = tank;
        this._bullets = [];
        this._t = 0;

        this.on('move', this._onMove);

        // reloading
        new Motion({maxSpeed: this.params.loadSpeed})
            .on('move', obj => this._onLoad(obj))
            .start();

        // time compensation while not shooting
        new Ticker()
            .on('tick', obj => this._onTime(obj))
            .start();
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            maxSpeed: 0.5,
            maxRange: 20,
            maxBullets: 4,
            loadSpeed: 1
        }, params));
    }

    _startAtTime(start) {
        return super._startAtTime(start - this._t);
    }

    _onMove(obj) {
        const unit = this._tank;
        const absMoved = Math.max(obj.moved, 0);
        const bullets = this._bullets.splice(this._bullets.length - absMoved, absMoved);

        while (bullets.length) {
            this._t = 0;

            bullets.pop()
                .setDirection(unit.getDirection())
                .setPos(...unit.calcPos(...unit.getPos(), 1))
                .start();
        }
    }

    _onLoad(obj) {
        const {maxRange, maxBullets} = this.params;
        let absMoved = Math.max(obj.moved, 0);

        while (absMoved) {
            absMoved -= 1;

            if (this._bullets.length < maxBullets) {
                this._bullets.push(new Bullet(this._tank.getGame(), {maxRange: maxRange}));
            }
        }
    }

    _onTime(obj) {
        this._t = Math.min(this._t + obj.estDelta, (1 / this.getCurSpeed() * 1000));
    }

}

export default Shooting;
