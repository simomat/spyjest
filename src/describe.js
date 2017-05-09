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


export const getMismatchDescription = (actual, expectedArgs, expectedCount) => {
    if (expectedArgs.length === 0) {
        if (isNaN(expectedCount)) {
            if (actual.__calls.length === 0) {
                return 'was not called';
            }
        } else {
            if (actual.__calls.length !== expectedCount) {
                return `was called ${actual.__calls.length} times`;
            }
        }
    } else {
        if (isNaN(expectedCount)) {
            if (noMatchingCall(actual.__calls, expectedArgs)) {
                return 'was not called with expected arguments';
            }
        } else {
            let matchingCount = matchingCallsCount(actual.__calls, expectedArgs);
            if (matchingCount !== expectedCount) {
                return `was called ${matchingCount} times with expected arguments`;
            }
        }
    }
};

export const describeMatcher = (numCalls, withArgs, description) => {
    description.append('a function that was');

    if (numCalls === 0) {
        description.append(' not')
    }
    description.append(' called');

    if (Number.isInteger(numCalls) && numCalls > 0) {
        description.append(` ${numCalls} times`);
    }

    if (withArgs.length > 0) {
        description.append(' with arguments: ');
        for (let i = 0; i < withArgs.length - 1; i++) {
            withArgs[i].describeTo(description);
            description.append(', ');
        }
        withArgs[withArgs.length - 1].describeTo(description);
    }
};