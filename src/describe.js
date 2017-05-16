import deepEqual from 'deep-equal';
import {allMatchersApply, zipLimitFirst} from './util';

const noMatchingCall = (calls, expectedArgs) =>
    ! calls.some(actualArgs =>
        zipLimitFirst(expectedArgs, actualArgs)
            .every(([expected, actual]) => expected.matches(actual)));

const matchingCallsCount = (calls, expectedArgs) =>
    calls.map(call =>
        allMatchersApply(expectedArgs, call))
    .reduce((count, matched) => matched ? count + 1 : count, 0);

const allEqual = (itemsA, itemsB) => {
    for (let i = 0; i < Math.max(itemsA.length, itemsB.length); i++) {
        if (!deepEqual(itemsA[i], itemsB[i])) {
            return false;
        }
    }
    return true;
};

const buildCallGroups = calls => calls.reduce((groups, call) => {
    let group = groups.find(group => allEqual(group.args, call));
    if (group) {
        group.count ++;
    } else {
        groups.push({count: 1, args: call});
    }
    return groups;
}, []);

const getUnmatchingCalls = (calls, expectedArgs) => calls.filter(call => !allMatchersApply(expectedArgs, call));

const argsToString = args => `(${args.map(arg => JSON.stringify(arg)).join(', ')})`;

const describeGroupes = (groups, describe) =>
    groups.forEach(g => describe.append(`            ${g.count} time${g.count === 1?' ':'s'} with: ${argsToString(g.args)}\n`));


export const getMismatchDescriber = (actual, expectedArgs, expectedCount) => {
    if (isNaN(expectedCount) && actual.__calls.length === 0) {
        return d => d.append('was not called');
    }

    if (expectedArgs.length === 0) {
        if (!isNaN(expectedCount) && actual.__calls.length !== expectedCount) {
            return d => d.append(`was called ${actual.__calls.length} times`);
        }
    } else {
        if (isNaN(expectedCount)) {
            if (noMatchingCall(actual.__calls, expectedArgs)) {
                return d => {
                    d.append('was not called with expected arguments, but was called\n');
                    describeGroupes(buildCallGroups(actual.__calls), d);
                }
            }
        } else {
            let matchingCount = matchingCallsCount(actual.__calls, expectedArgs);
            if (matchingCount !== expectedCount) {
                return d => {
                    let groups = buildCallGroups(getUnmatchingCalls(actual.__calls, expectedArgs));
                    d.append(`was called ${matchingCount} times with expected arguments;`);
                    if (groups.length > 0) {
                        d.append(' and was also called\n');
                        describeGroupes(buildCallGroups(actual.__calls), d);
                    } else {
                        d.append(' and no other call was made')
                    }
                }
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