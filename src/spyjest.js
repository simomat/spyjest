import {equalTo} from 'hamjest';
import {allMatchersApply} from './util';
import {describeMatcher, getMismatchDescription} from './describe';

const isMatcher = obj => typeof obj.matches === 'function' && typeof obj.describeTo === 'function';
const toMatchers = args => args.map(arg => isMatcher(arg) ? arg : equalTo(arg));

export const wasCalled = () => new FunctionMatcher([]);
export const wasNotCalled = () => wasCalled().times(0);
export function wasCalledWith() {
    return new FunctionMatcher(toMatchers(Array.from(arguments)));
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
    matches: function (actual) {
        return !Boolean(this._getMismatch(actual));
    },
    describeTo: function (description) {
        return describeMatcher(this._expectedCount, this._expectedArgs, description);
    },
    describeMismatch: function (actual, description) {
        description.append(this._getMismatch(actual));
    },
    _getMismatch: function (actual) {
        return getMismatchDescription(actual, this._expectedArgs, this._expectedCount);
    }
};

const applyMocking = mocking => {
    if (mocking.doReturn) {
        return mocking.returnValue;
    }
    throw mocking.error;
};

export function spy(callable = () => undefined) {
    const calls = [];
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
        let args = Array.from(arguments);
        calls.push(args);
        return dispatchCall(args);
    };

    spy.__calls = calls;
    spy.whenCalledWith = function () {
        let args = Array.from(arguments);
        let matchArguments = toMatchers(args);
        return {
            doReturn: returnValue => mockings.push({matchArguments, returnValue, doReturn:true}),
            doThrow: error => mockings.push({matchArguments, error, doThrow:true})
        };
    };
    return spy;
}
