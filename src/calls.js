import deepEqual from 'deep-equal';
import {allMatchersApply, zipLimitFirst} from './util';

const allEqual = (itemsA, itemsB) => {
    let maxLength = Math.max(itemsA.length, itemsB.length);
    for (let i = 0; i < maxLength; i++) {
        if (!deepEqual(itemsA[i], itemsB[i])) {
            return false;
        }
    }
    return true;
};

export const Calls = function (callArray = []) { this._calls = callArray; };
Calls.prototype = {
    add: function (call) {
        this._calls.push(call);
    },
    filterUnmatching: function (args) {
        return new Calls(this._calls.filter(call => !allMatchersApply(args, call)));
    },
    hasMatching: function (args) {
        return this._calls.some(actualArgs => zipLimitFirst(args, actualArgs)
            .every(([expected, actual]) => expected.matches(actual)));
    },
    getMatchCount: function(args) {
        return this._calls.map(call => allMatchersApply(args, call))
            .reduce((count, matched) => matched ? count + 1 : count, 0);
    },
    get isEmpty() {
        return this._calls.length === 0;
    },
    get length() {
        return this._calls.length;
    },
    get callGroups() {
        return this._calls.reduce((groups, call) => {
            let group = groups.find(group => allEqual(group.args, call));
            if (group) {
                group.count ++;
            } else {
                groups.push({count: 1, args: call});
            }
            return groups;
        }, []);
    },
};