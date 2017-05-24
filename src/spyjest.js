import {equalTo} from 'hamjest';
import {allMatchersApply} from './util';
import {describeMatcher, getMismatchDescriber} from './describe';
import {Calls} from './calls';

const isMatcher = obj => typeof obj.matches === 'function' && typeof obj.describeTo === 'function';
const toMatchers = args => Array.prototype.map.call(args, arg => isMatcher(arg) ? arg : equalTo(arg));

export const wasCalled = () => new FunctionMatcher([]);
export const wasNotCalled = () => wasCalled().times(0);
export function wasCalledWith() {
    return new FunctionMatcher(toMatchers(arguments));
}

const FunctionMatcher = function (argMatchers) {
    this._expectedArgs = argMatchers;
    this._expectedCount = NaN;
};
FunctionMatcher.prototype = {
    times: function (count) {
        this._expectedCount = Number.parseInt(count);
        return this;
    },
    matches: function (spy) {
        return !Boolean(this._getMismatch(spy));
    },
    describeTo: function (description) {
        return describeMatcher(this._expectedCount, this._expectedArgs, description);
    },
    describeMismatch: function (spy, description) {
        let describer = this._getMismatch(spy);
        describer(description);
    },
    _getMismatch: function (spy) {
        return getMismatchDescriber(spy.__calls, this._expectedArgs, this._expectedCount);
    }
};

const applyMocking = mocking => {
    if (mocking.doReturn) {
        return mocking.returnValue;
    }
    throw mocking.error;
};

export function spy(callable = () => undefined) {
    const calls = new Calls();
    const mockings = [];

    const dispatchCall = args => {
        for (let mocking of mockings) {
            if (mocking.matchArguments.length === 0 && args.length > 0) {
                return callable(...args);
            }
            if (allMatchersApply(mocking.matchArguments, args)) {
                return applyMocking(mocking);
            }
        }
        return callable(...args);
    };

    const spy = function () {
        calls.add(arguments);
        return dispatchCall(arguments);
    };

    spy.__calls = calls;
    spy.whenCalledWith = function () {
        let matchArguments = toMatchers(arguments);
        return {
            doReturn: returnValue => mockings.push({matchArguments, returnValue, doReturn:true}),
            doThrow: error => mockings.push({matchArguments, error, doThrow:true})
        };
    };
    return spy;
}
