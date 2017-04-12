import {Description} from 'hamjest';
import {applyMatchers} from './applymatchers';
import {aFunctionThatWasCalled} from "./describe";

export class FunctionMatcher {
    constructor(argMatchers) {
        this.expectedArgs = argMatchers;
        this.expectedCount = NaN;
    }

    matches(actual) {
        return applyMatchers(actual, this.expectedArgs, this.expectedCount).match;
    }

    describeTo(description) {
        aFunctionThatWasCalled()
            .times(this.expectedCount)
            .withArgs(this.expectedArgs)
            .describeTo(description);
    }

    describeMismatch(actual, description) {
        let matchResult = applyMatchers(actual, this.expectedArgs, this.expectedCount);
        if (! matchResult.match) {
            matchResult.actualDescribe.describeTo(description);
        }
    }

    getExpectedForDiff() {
        let description = new Description();
        this.describeTo(description);
        return description.get();
    }

    formatActualForDiff(actual) {
        const description = new Description();
        this.describeMismatch(actual, description);
        return description.get();
    }

    times(count) {
        this.expectedCount = Number.parseInt(count);
        return this;
    }
}