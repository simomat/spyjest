import {equalTo} from 'hamjest';
import {Calls} from './calls';
import {allMatchersApply, FunctionMatcher} from './matcher';

const isMatcher = obj => typeof obj.matches === 'function' && typeof obj.describeTo === 'function';
const toMatchers = args => Array.prototype.map.call(args, arg => isMatcher(arg) ? arg : equalTo(arg));

export const wasCalled = () => new FunctionMatcher([]);
export const wasNotCalled = () => wasCalled().times(0);
export function wasCalledWith() { return new FunctionMatcher(toMatchers(arguments)); }
export function spy(callable = () => undefined) {
    const mockings = [];
    const findMocking = args => {
        if (args.length > 0) {
            return mockings.find(mocking => mocking.matchArguments.length > 0 && allMatchersApply(mocking.matchArguments, args));
        }
        return mockings.find(mocking => mocking.matchArguments.length === 0);
    };
    const dispatchCall = args => {
        let mocking = findMocking(args);
        if (mocking) {
            if (mocking.doThrow) {
                throw mocking.error;
            }
            return mocking.returnValue;
        }
        return callable(...args);
    };

    const calls = new Calls();
    const spy = function () {
        calls.add(arguments);
        return dispatchCall(arguments);
    };

    spy.__calls = calls;
    spy.whenCalledWith = function () {
        let matchArguments = toMatchers(arguments);
        return {
            doReturn: returnValue => mockings.push({matchArguments, returnValue}),
            doThrow: error => mockings.push({matchArguments, error, doThrow:true})
        };
    };
    return spy;
}
