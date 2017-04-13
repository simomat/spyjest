import {strictlyEqualTo} from 'hamjest';
import {FunctionMatcher} from './functionmatcher'
import {spy} from './spy'

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

export {spy};
