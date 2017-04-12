import {aFunctionThatWasCalled} from "./describe";

const noMatch = (actual) => ({
    match: false,
    actualDescribe: actual
});


const zipLimitFirst = (first, second) => {
    let zipped = [];
    for (let i = 0; i < first.length; i++) {
        zipped.push([first[i], second[i]]);
    }
    return zipped;
};

const noMatchingCall = (calls, expectedArgs) =>
    ! calls.some(actualArgs =>
                zipLimitFirst(expectedArgs, actualArgs)
                .every(([expected, actual]) => expected.matches(actual)));


const matchingCallsCount = (calls, expectedArgs) =>
    calls.map(call =>
            zipLimitFirst(expectedArgs, call)
            .every(([expected, actual]) => expected.matches(actual)))
        .reduce((count, matched) => matched ? count + 1 : count, 0);

export function applyMatchers(actual, expectedArgs, expectedCount) {
    if (expectedArgs.length === 0) {
        if (Number.isNaN(expectedCount)) {
            if (actual.__calls.length === 0) {
                return noMatch(aFunctionThatWasCalled().times(0));
            }
        } else {
            if (actual.__calls.length !== expectedCount) {
                return noMatch(aFunctionThatWasCalled().times(actual.__calls.length));
            }
        }
    } else {
        if (Number.isNaN(expectedCount)) {
            if (noMatchingCall(actual.__calls, expectedArgs)) {
                // TODO: maybe add description of what the function was called with instead (if any, and limit to some calls)
                return noMatch(aFunctionThatWasCalled().times(0).withArgs(expectedArgs));
            }
        } else {
            let actualCount = matchingCallsCount(actual.__calls, expectedArgs);
            if (actualCount !== expectedCount) {
                return noMatch(aFunctionThatWasCalled().times(actualCount).withArgs(expectedArgs));
            }
        }
    }

    return {match: true};
}
