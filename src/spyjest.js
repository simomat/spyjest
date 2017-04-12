import {strictlyEqualTo} from 'hamjest';
import {FunctionMatcher} from './functionmatcher'

function toMatches(args) {
    return args.map(arg => {
        if (typeof arg.matches === 'function' && typeof arg.describeTo === 'function') {
            return arg
        }
        return strictlyEqualTo(arg);
    });
}

export function wasCalled() {
    return new FunctionMatcher([]);
}

export function wasCalledWith() {
    return new FunctionMatcher(toMatches(Array.from(arguments)));
}

export function spy(callable) {
    let calls = [];
    let spy = function () {
        calls.push(Array.from(arguments));
        return callable(...arguments);
    };
    spy.__calls = calls;
    return spy;
}