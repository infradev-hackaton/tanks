import Events from './events';
import Bullet from './bullet';
import Tank from './tank';
import Unit from './unit';

function rad(deg) {
    return deg * Math.PI / 180;
}

class CanvasView extends Events {

    constructor(canvas, params) {
        super(params);
        this._canvas = canvas;
    }

    get _ctx() {
        return this._canvas.getContext('2d');
    }

    setPixelRatio(ratio) {
        this.params.pixelRatio = ratio;
        return this;
    }

    getPixelRatio() {
        return this.params.pixelRatio;
    }

    doLayout(game) {
        this.clear();

        this._strokeDebugGrid();

        game.each((unit, x, y) => {
            if (unit instanceof Unit) {
                const d = unit.getDirection();

                if (unit instanceof Tank) {
                    this._strokeTank(x, y, d);
                } else if (unit instanceof Bullet) {
                    this._strokeBullet(x, y, d);
                }
            }
        });

        return this;
    }

    clear() {
        const {width, height} = this.params;
        const canvas = this._canvas;

        canvas.width = this._cPx(width);
        canvas.height = this._cPx(height);

        return this;
    }

    _strokeDebugGrid() {
        const ctx = this._ctx;
        const canvas = this._canvas;
        const {width: width, height: height} = canvas;
        const {resolution} = this.params;

        let x = Math.round(width / resolution);
        let y = Math.round(height / resolution);

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = this._px(1);
        ctx.strokeStyle = '#ccc';

        while (x) {
            x -= 1;
            const pxX = this._cPx(x);

            ctx.moveTo(pxX, 0);
            ctx.lineTo(pxX, height);
        }

        while (y) {
            y -= 1;
            const pxY = this._cPx(y);

            ctx.moveTo(0, pxY);
            ctx.lineTo(width, pxY);
        }

        ctx.stroke();

        ctx.closePath();
        ctx.restore();
    }

    _getStyle(type, name) {
        return $(type, this._canvas).css(name);
    }

    _strokeTank(x, y, d) {
        const pxX = this._cPx(x);
        const pxY = this._cPx(y);
        const pxW = this._cPx(1);
        const pxH = this._cPx(1);

        this._strokeWheelsPx(pxX, pxY, pxW, pxH, d);
        this._strokeBodyPx(pxX, pxY, pxW, pxH, d);
        this._strokeTowerPx(pxX, pxY, pxW, pxH, d);
        this._strokeGunPx(pxX, pxY, pxW, pxH, d);
    }

    _strokeWheelsPx(pxX, pxY, pxW, pxH, d) {
        const ctx = this._ctx;
        const WHEEL_W = 0.2;

        ctx.save();

        ctx.fillStyle = this._getStyle('.tank .wheels', 'background-color');

        ctx.translate(pxX + pxW / 2, pxY + pxH / 2);
        ctx.rotate(rad(d));

        ctx.fillRect(
            -pxW / 2,
            -pxH / 2,
            pxW * WHEEL_W,
            pxH);

        ctx.fillRect(
            -pxW / 2 + (pxW - pxW * WHEEL_W),
            -pxH / 2,
            pxW * WHEEL_W,
            pxH);

        ctx.restore();
    }

    _strokeBodyPx(pxX, pxY, pxW, pxH, d) {
        const ctx = this._ctx;
        const BODY_W = 0.8;
        const BODY_H = 0.7;

        ctx.save();

        ctx.fillStyle = this._getStyle('.tank', 'background-color');

        ctx.translate(pxX + pxW / 2, pxY + pxH / 2);
        ctx.rotate(rad(d));

        ctx.fillRect(
            -pxW / 2 + (pxW - pxW * BODY_W) / 2,
            -pxH / 2 + (pxH - pxH * BODY_H) / 2,
            pxW * BODY_W,
            pxH * BODY_H);

        ctx.restore();
    }

    _strokeTowerPx(pxX, pxY, pxW, pxH, d) {
        const ctx = this._ctx;

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = this._cPx(1) / 20;
        ctx.strokeStyle = this._getStyle('.tank', 'color');
        ctx.arc(pxX + pxW / 2, pxY + pxH / 2, pxW / 4, 0, 2 * Math.PI, false);
        ctx.stroke();

        ctx.closePath();
        ctx.restore();
    }

    _strokeGunPx(pxX, pxY, pxW, pxH, d) {
        const ctx = this._ctx;
        const GUN_W = 0.1;

        ctx.save();
        ctx.fillStyle = this._getStyle('.tank', 'color');

        ctx.translate(pxX + pxW / 2, pxY + pxH / 2);
        ctx.rotate(rad(d));

        ctx.fillRect(
            -pxW / 2 + (pxW - pxW * GUN_W) / 2,
            -pxH / 2,
            pxW * GUN_W,
            pxH / 2);

        ctx.restore();
    }

    _strokeBullet(x, y) {
        let ctx = this._ctx;
        let pxX = this._cPx(x);
        let pxY = this._cPx(y);
        let pxD = this._cPx(1);

        ctx.save();
        ctx.beginPath();

        ctx.fillStyle = this._getStyle('.bullet', 'background-color');

        ctx.arc(pxX + pxD / 2, pxY + pxD / 2, pxD / 6, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }

    _createParams(params) {
        return super._createParams(Object.assign({
            width: 10,
            height: 10,
            pixelRatio: 1,
            resolution: 10
        }, params));
    }

    _px(px) {
        return px * this.getPixelRatio();
    }

    _cPx(cells) {
        return cells * this._px(this.params.resolution);
    }

}

export default CanvasView;
