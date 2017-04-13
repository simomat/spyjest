
import {assertThat,hasItem, is} from 'hamjest';

import {wasCalled, wasCalledWith, spy} from '../lib/spyjest';


describe("Function Matcher", function () {

    it("matches a call of a function", function () {
        let callableSpy = spy(x => x);

        callableSpy();

        assertThat(callableSpy, wasCalled());
    });

    it("spy wraps a function and allows call-through", function () {
        let callableSpy = spy(x => x * 2);

        let result = callableSpy(3);

        assertThat(result, is(6));
    });

    it("detect a function was not called", function () {
        let callableSpy = spy(x => x);

        assertThat(callableSpy, wasCalled().times(0));
    });

    it("verifies a function was called n times", function () {
        let callableSpy = spy(x => x);

        callableSpy();
        callableSpy();
        callableSpy();

        assertThat(callableSpy, wasCalled().times(3));
    });

    it("matches an argument of a called function", function () {
        let callableSpy = spy(x => x);

        callableSpy(5);

        assertThat(callableSpy, wasCalledWith(5));
    });

    it("verifies a function was called with specific argument n times regardless other calls", function () {
        let callableSpy = spy(x => x);

        callableSpy(5);
        callableSpy(5);
        callableSpy(2);

        assertThat(callableSpy, wasCalledWith(5).times(2));
        assertThat(callableSpy, wasCalledWith(2).times(1));
    });

    it("verifies function arguments that are matchers", function () {
        let callableSpy = spy(x => x);

        callableSpy([1, 2, 3]);

        assertThat(callableSpy, wasCalledWith(hasItem(2)));
    });

    it("call arguments that are not expected are ignored", function () {
        let callableSpy = spy((x,y) => x);

        callableSpy([1, 2, 3], 'I am ignored');

        assertThat(callableSpy, wasCalledWith(hasItem(2)));
    });

    it("multiple matchers are supported", function () {
        let callableSpy = spy((x,y,z) => x);

        callableSpy(42, [1, 2, 3], 'I am ignored');

        assertThat(callableSpy, wasCalledWith(42, hasItem(2)));
    });

    it("counting calls with matching arguments is supported", function () {
        let callableSpy = spy(x => x);

        callableSpy([1, 2, 3]);
        callableSpy([2, 33, 44]);
        callableSpy([33, 44, 55]);

        assertThat(callableSpy, wasCalledWith(hasItem(2)).times(2));
    });

});
