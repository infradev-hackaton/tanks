import EventEmitter from 'events';

class Events extends EventEmitter {

    constructor(params) {
        super();
        this.params = this._createParams(params);
    }

    un(type, func) {
        if (typeof func === 'function') {
            return this.removeListener(type, func);
        }

        return this.removeAllListeners(type);
    }

    _createParams(params) {
        return Object.assign({}, params);
    }

}

export default Events;
