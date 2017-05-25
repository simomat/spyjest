const pluralS = (count, singularString = '') => count === 1 ? singularString : 's';
const argsToString = args => `(${Array.prototype.map.call(args, arg => JSON.stringify(arg)).join(', ')})`;
const describeCallGroups = (groups, describe) => groups.forEach(group =>
        describe.append(`            ${group.count} time${pluralS(group.count, ' ')} with: ${argsToString(group.args)}\n`));

export const getMismatchDescriber = (actualCalls, expectedArgs, expectedCount) => {
    if (isNaN(expectedCount) && actualCalls.isEmpty) {
        return d => d.append('was not called');
    }

    if (expectedArgs.length === 0) {
        if (!isNaN(expectedCount) && actualCalls.length !== expectedCount) {
            return d => d.append(`was called ${actualCalls.length} time${pluralS(actualCalls.length)}`);
        }
    } else {
        if (isNaN(expectedCount)) {
            if (! actualCalls.hasMatching(expectedArgs)) {
                return d => {
                    d.append('was not called with expected arguments, but was called\n');
                    describeCallGroups(actualCalls.callGroups, d);
                }
            }
        } else {
            let matchingCount = actualCalls.getMatchCount(expectedArgs);
            if (matchingCount !== expectedCount) {
                return d => {
                    let groups = actualCalls.filterUnmatching(expectedArgs).callGroups;
                    d.append(`was called ${matchingCount} time${pluralS(matchingCount)} with expected arguments;`);
                    if (groups.length > 0) {
                        d.append(' and was also called\n');
                        describeCallGroups(groups, d);
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
        withArgs[0].describeTo(description);
        for (let arg of withArgs.slice(1)) {
            description.append(', ');
            arg.describeTo(description);
        }
    }
};