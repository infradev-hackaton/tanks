import Unit from './unit';
import Ticker from './ticker';

class Game extends Ticker {

    constructor(params) {
        super(params);

        this._area = [];
        this._units = {};
        this.reset();
    }

    fitPos(x, y) {
        const {width, height} = this.params;

        x = Math.max(x, 0);
        x = Math.min(x, width - 1);

        y = Math.max(y, 0);
        y = Math.min(y, height - 1);

        return [x, y];
    }

    each(fn, ctx) {
        const area = this._area;

        for (let y = 0, height = area.length; y < height; y += 1) {
            for (let x = 0, width = area[y].length; x < width; x += 1) {
                if (fn.call(ctx, area[y][x], x, y, area) === false) {
                    return false;
                }
            }
        }

        return true;
    }

    reset() {
        const {width, height} = this.params;
        const area = this._area;

        this.pause();

        area.length = height;

        let y = height;

        while (y) {
            y -= 1;
            area[y] = new Array(width);

            let x = width;

            while (x) {
                x -= 1;
                area[y][x] = null;
            }
        }

        this._units = {};
        return this;
    }

    delUnit(unit) {
        unit.pauseAll();
        this._setObj(...this.getPos(unit), null);
    }

    getPos(unit) {
        if (!(unit instanceof Unit)) {
            return [-1, -1];
        }

        const xy = this._units[unit.id];

        if (Array.isArray(xy)) {
            return xy;
        }

        return [-1, -1];
    }

    setPos(existingX, existingY, currentUnit) {
        this._setObj(...this.getPos(currentUnit), null);
        this._setObj(existingX, existingY, currentUnit);
    }

    _getObj(x, y) {
        if (Array.isArray(this._area[y])) {
            return this._area[y][x];
        }

        return null;
    }

    _setObj(x, y, obj) {
        const {width, height} = this.params;

        if (x > -1 && x < width && y > -1 && y < height) {
            const exObj = this._getObj(x, y);

            if (exObj instanceof Unit) {
                delete this._units[exObj.id];
            }

            this._area[y][x] = obj;

            if (obj instanceof Unit) {
                this._units[obj.id] = [x, y];
            }
        }
    }

}

export default Game;
