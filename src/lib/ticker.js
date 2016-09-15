import Events from './events';

let stack = [];

class Ticker extends Events {

    constructor(params) {
        super(params);

        this._tickId = 0;
        this._running = false;
    }

    reset() {
        return this;
    }

    isRunning() {
        return this._running;
    }

    start() {
        if (!this.isRunning()) {
            this._running = true;
            this._startAtTime(Date.now());
        }

        return this;
    }

    pause() {
        if (this.isRunning()) {
            this._running = false;
            Ticker.delFrame(this._tickId);
        }

        return this;
    }

    _startAtTime(start) {
        this._run(start);
    }

    _run(start) {
        const now = Date.now();

        this._tickId = Ticker.addFrame.call(this, this._run, now);

        this.emit('tick', {
            estDelta: now - start
        });
    }

    static addFrame(func, ...args) {
        const frame = {
            id: Math.random() * Math.random(),
            func: func,
            that: this,
            args: args
        };

        if (stack.push(frame) === 1) {
            setTimeout(() => {
                const frames = stack;

                stack = [];

                for (let i = 0, l = frames.length; i < l; i += 1) {
                    let {func, args, that} = frames[i];
                    func.call(that, ...args);
                }
            }, 0);
        }

        return frame.id;
    }

    static delFrame(id) {
        let l = stack.length;
        let deleted = false;

        while (l) {
            l -= 1;
            if (stack[l].id === id) {
                stack.splice(l, 1);
                deleted = true;
            }
        }

        return deleted;
    }

}

export default Ticker;
