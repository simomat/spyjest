import {assertThat, hasItem, is, undef, anything, fail, allOf, containsString} from 'hamjest';
import {wasCalled, wasCalledWith, wasNotCalled, spy} from '../src/spyjest';

describe('describe expected', function () {

    it('a function that was called', function () {
        let fun = spy();

        onFailingAssert(fun, wasCalled())
            .expectMessage(
                containsString('Expected: a function that was called'));
    });

    it('a function that was not called', function () {
        let fun = spy();
        fun();

        onFailingAssert(fun, wasNotCalled())
            .expectMessage(
                containsString('Expected: a function that was not called'));
    });

    it('a function that was called n times', function () {
        let fun = spy();

        onFailingAssert(fun, wasCalled().times(3))
            .expectMessage(
                containsString('Expected: a function that was called 3 times'));
    });

    it('a function that was called with args', function () {
        let fun = spy();

        onFailingAssert(fun, wasCalledWith(2, 'a'))
            .expectMessage(
                containsString('Expected: a function that was called with arguments: <2>, "a"'));
    });

    it('a function that was called n times with args', function () {
        let fun = spy();

        onFailingAssert(fun, wasCalledWith(2, 'a').times(2))
            .expectMessage(
                containsString('Expected: a function that was called 2 times with arguments: <2>, "a"'));
    });
});

describe('describe actual', function () {

    it('was not called', function () {
        let fun = spy();

        onFailingAssert(fun, wasCalled())
            .expectMessage(
                containsString('but: was not called'));
    });

    it('was called 1 time', function () {
        let fun = spy();
        fun();

        onFailingAssert(fun, wasNotCalled())
            .expectMessage(
                containsString('but: was called 1 time'));
    });

    it('was called x times', function () {
        let fun = spy();
        fun();
        fun();

        onFailingAssert(fun, wasNotCalled())
            .expectMessage(
                containsString('but: was called 2 times'));
    });

    it('was not called with args', function () {
        let fun = spy();
        fun(2);
        fun(2);
        fun('a', 3);

        onFailingAssert(fun, wasCalledWith(1))
            .expectMessage(
                containsString('but: was not called with expected arguments, but was called'),
                containsString('2 times with: (2)'),
                containsString('1 time  with: ("a", 3)'));
    });

    it('was called n times with args and no other call was made', function () {
        let fun = spy();
        fun(1);

        onFailingAssert(fun, wasCalledWith(1).times(2))
            .expectMessage(
                containsString('but: was called 1 time with expected arguments;'),
                containsString('and no other call was made'));
    });

    it('was called n times with args and no other call was made', function () {
        let fun = spy();
        fun(1);
        fun(1);
        fun('a', 3);

        onFailingAssert(fun, wasCalledWith(1).times(1))
            .expectMessage(
                containsString('but: was called 2 times with expected arguments;'),
                containsString('and was also called'),
                containsString('1 time  with: ("a", 3)'));
    });
});


describe('description showcases from README', function () {

    it('case 1', function () {
        let someProductiveFunction = f => f();

        let spyFunction = spy();

        someProductiveFunction(spyFunction);

        assertThat(spyFunction, wasCalled());
        onFailingAssert(spyFunction, wasNotCalled())
            .expectMessage(
                containsString('Expected: a function that was not called'),
                containsString('but: was called 1 time'));
    });

    it('case 2', function () {
        let fun = spy();
        fun(); fun(); fun();
        onFailingAssert(fun, wasCalled().times(2))
            .expectMessage(
                containsString('Expected: a function that was called 2 times'),
                containsString('but: was called 3 times'));
    });

    it('case 3', function () {
        let fn = spy();
        fn(42); fn(42); fn('wat'); fn('wat'); fn(); fn('42', {a: [1,2,3]});

        onFailingAssert(fn, wasCalledWith(42).times(3))
            .expectMessage(
                containsString('Expected: a function that was called 3 times with arguments: <42>'),
                containsString('but: was called 2 times with expected arguments; and was also called'),
                containsString('2 times with: ("wat")'),
                containsString('1 time  with: ()'),
                containsString('1 time  with: ("42", {"a":[1,2,3]})'));
    });

    it('case 4', function () {
        let fn = spy();

        fn(42, [1, 2, 3]);
        fn(42, [2, 33, 44], 'dont mind me');
        fn(42, ['a', 33, 2]);

        assertThat(fn, wasCalledWith(anything(), hasItem('a')));
        onFailingAssert(fn, wasCalledWith(42, hasItem(2)).times(2))
            .expectMessage(
                containsString('Expected: a function that was called 2 times with arguments: <42>, an array containing <2>'),
                containsString('but: was called 3 times with expected arguments; and no other call was made'))
    });
});


function onFailingAssert(spyFn, matcher) {
    try {
        assertThat(spyFn, matcher);
    } catch (error) {
        if (typeof error.message === 'string' || error.message instanceof String) {
            return {
                expectMessage: function () {
                    assertThat(error.message, allOf(...arguments))
                }
            };
        }

        throw error;
    }

    fail('the assertion did not fail');
}

