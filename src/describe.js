
class Describer {
    constructor() {
        this._numCalls = NaN;
        this._withArgs = [];
    }

    times(calls) {
        this._numCalls = calls;
        return this;
    }

    withArgs(args) {
        this._withArgs = args;
        return this;
    }

    describeTo(description) {
        description.append('a function that was ');

        if (this._numCalls === 0) {
            description.append('not ')
        }
        description.append('called');

        if (Number.isInteger(this._numCalls) && this._numCalls > 0) {
            description.append(` ${this._numCalls} times`);
        }

        if (this._withArgs.length > 0) {
            description.append(' with arguments: ');
            for (let i = 0; i < this._withArgs.length -1; i++) {
                this._withArgs[i].describeTo(description);
                description.append(', ');
            }
            this._withArgs[this._withArgs.length-1].describeTo(description);
        }
    }
}

export function aFunctionThatWasCalled() {
    return new Describer();
}
