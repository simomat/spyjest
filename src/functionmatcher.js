import {describeMatcher, getMismatchDescription} from './describe';

export class FunctionMatcher {
    constructor(argMatchers) {
        this.expectedArgs = argMatchers;
        this.expectedCount = NaN;
    }

    times(count) {
        this.expectedCount = Number.parseInt(count);
        return this;
    }

    matches(actual) {
        return ! Boolean(this._getMismatch(actual));
    }

    describeTo(description) {
        return describeMatcher(this.expectedCount,  this.expectedArgs, description);
    }

    describeMismatch(actual, description) {
        description.append(this._getMismatch(actual));
    }

    _getMismatch(actual) {
        return getMismatchDescription(actual, this.expectedArgs, this.expectedCount);
    }
}
