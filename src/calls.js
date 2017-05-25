import deepEqual from 'deep-equal';
import {allMatchersApply} from './matcher';

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
    filterUnmatching: function (argMatchers) {
        return new Calls(this._calls.filter(callArgs => !allMatchersApply(argMatchers, callArgs)));
    },
    hasMatching: function (argMatchers) {
        return this._calls.some(callArgs => allMatchersApply(argMatchers, callArgs));
    },
    getMatchCount: function(argMatchers) {
        return this._calls.reduce((count, callArgs) => allMatchersApply(argMatchers, callArgs) ? count + 1 : count, 0);
    },
    get isEmpty() {
        return this._calls.length === 0;
    },
    get length() {
        return this._calls.length;
    },
    get callGroups() {
        return this._calls.reduce((groups, callArgs) => {
            let group = groups.find(group => allEqual(group.args, callArgs));
            if (group) {
                group.count ++;
            } else {
                groups.push({count: 1, args: callArgs});
            }
            return groups;
        }, []);
    },
};