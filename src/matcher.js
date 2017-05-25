import {describeMatcher, getMismatchDescriber} from './describe';

export const FunctionMatcher = function (argMatchers) {
    this._expectedArgs = argMatchers;
    this._expectedCount = NaN;
};
FunctionMatcher.prototype = {
    times: function (count) {
        this._expectedCount = Number.parseInt(count);
        return this;
    },
    matches: function (spy) {
        return this._getMismatch(spy) === undefined;
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

export const allMatchersApply = (matchers, args) => {
    if (args.length > matchers.length) {
        return false;
    }
    for (let i = 0; i < matchers.length; i++) {
        if (! matchers[i].matches(args[i])) {
            return false;
        }
    }
    return true;
};
