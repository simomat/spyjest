import {assertThat, hasItem, is, undef, anything} from 'hamjest';
import {wasCalled, wasCalledWith, wasNotCalled, spy} from '../src/spyjest';

describe('spy feature', function () {

    it('matches a call of a function', function () {
        let fn = spy();

        fn();

        assertThat(wasCalled().matches(fn), is(true));
    });

    it('wasNotCalled() does not match a function that was called', function () {
        let fn = spy();

        fn();

        assertThat(wasNotCalled().matches(fn), is(false));
    });

    it('matches a function was not called', function () {
        let fn = spy();

        assertThat(wasCalled().matches(fn), is(false));
    });

    it('matches a function was not called with wasNotCalled()', function () {
        let fn = spy();

        assertThat(wasNotCalled().matches(fn), is(true));
    });

    it('calling the spy without wrapping a function returns undefined', function () {
        let fn = spy();

        assertThat(fn(3), is(undef()));
    });

    it('matches a a function was called n times', function () {
        let fn = spy();

        fn();
        fn();
        fn();

        assertThat(wasCalled().times(3).matches(fn), is(true));
    });

    it('matches a a function was called not n times', function () {
        let fn = spy();

        fn();
        fn();

        assertThat(wasCalled().times(3).matches(fn), is(false));
    });

    it('matches a function was called with an argument', function () {
        let fn = spy();

        fn(5);

        assertThat(wasCalledWith(5).matches(fn), is(true));
    });

    it('matches a function was called with an argument', function () {
        let fn = spy();

        fn(2);

        assertThat(wasCalledWith(5).matches(fn), is(false));
    });

    it('matches a function was called with specific argument n times, regardless other calls', function () {
        let fn = spy();

        fn(5);
        fn(5);
        fn(2);

        assertThat(wasCalledWith(5).times(2).matches(fn), is(true));
        assertThat(wasCalledWith(2).times(1).matches(fn), is(true));
    });

    it('matches called arguments with matchers', function () {
        let fn = spy();

        fn([1, 2, 3]);

        assertThat(wasCalledWith(hasItem(2)).matches(fn), is(true));
    });

    it('all arguments must be expressed for a match', function () {
        let fn = spy();

        fn([1, 2, 3], 'I am ignored');

        assertThat(wasCalledWith(hasItem(2)).matches(fn), is(false));
    });

    it('less arguments than match arguments are allowed for a match', function () {
        let fn = spy();

        fn([1, 2, 3]);

        assertThat(wasCalledWith(hasItem(2), undef(), anything()).matches(fn), is(true));
    });

    it('passing multiple match args is supported', function () {
        let fn = spy();

        fn(42, [1, 2, 3]);

        assertThat(wasCalledWith(42, hasItem(2)).matches(fn), is(true));
    });

    it('matches only if all matchers apply', function () {
        let fn = spy();

        fn(42, [1, 2, 3]);

        assertThat(wasCalledWith('narf', hasItem(2)).matches(fn), is(false));
    });

    it('matches calls with arguments n times', function () {
        let fn = spy();

        fn([1, 2, 3]);
        fn([2, 33, 44]);
        fn([33, 44, 55]);

        assertThat(wasCalledWith(hasItem(2)).times(2).matches(fn), is(true));
    });
});



describe('mocking feature', function () {

    it('given a spyMock without mocks, it returns undefined', function () {
        let mocker = spy();

        assertThat(mocker(22), is(undef()));
    });

    it('given a spyMock with default function, it returns the result of the default function', function () {
        let mocker = spy(() => 8);

        assertThat(mocker(1,2,3), is(8));
    });

    it('given a spyMock learning an argument, it returns the default result when the argument does not match', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(8).doReturn(4);

        assertThat(mocker(3), is(99));
    });

    it('given a spyMock learning an argument, it returns the learned result', function () {
        let mocker = spy(() => 8);

        mocker.whenCalledWith(8).doReturn(4);

        assertThat(mocker(8), is(4));
    });

    it('given a spyMock learning a matcher argument, it returns the default result when the matcher does not match', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8)).doReturn(4);

        assertThat(mocker(3), is(99));
    });

    it('given a spyMock learning a matcher argument, it returns the learned result', function () {
        let mocker = spy(() => 8);

        mocker.whenCalledWith(is(8)).doReturn(4);

        assertThat(mocker(8), is(4));
    });

    it('given a spyMock learning some matcher arguments, it returns the default result when one specified matcher does not match', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), is('a')).doReturn(4);

        assertThat(mocker(3, 'a'), is(99));
    });

    it('given a spyMock learning a matcher argument, it returns the learned result', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), is('a')).doReturn(4);

        assertThat(mocker(8, 'a'), is(4));
    });

    it('given a spyMock learning some matcher arguments and the function is called with more arguments, it returns the default result when one specified matcher does not match', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), is('a')).doReturn(4);

        assertThat(mocker(3, 'a', 'andOneMore'), is(99));
    });

    it('given a spyMock learning some matcher arguments and the function is called with less arguments, the missing arguments count as "undefined"', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), undef(), anything()).doReturn(4);

        assertThat(mocker(8), is(4));
    });

    it('given a spyMock learning mixed matcher and literal arguments, it returns the default result when one specified arguments does not match', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), 'a').doReturn(4);

        assertThat(mocker(3, 'a'), is(99));
    });

    it('given a spyMock learning mixed matcher and literal arguments, it returns the learned result', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(8), 'a').doReturn(4);

        assertThat(mocker(8, 'a'), is(4));
    });

    it('given a spyMock learning with no arguments and the function is called with no arguments, it returns the learned result', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith().doReturn(4);

        assertThat(mocker(), is(4));
    });

    it('given a spyMock learning with no arguments and the function is called an argument, it returns the default result', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith().doReturn(4);

        assertThat(mocker('asd'), is(99));
    });

    ///
    it('given a spyMock learning some calls, it returns the default result when no learning matches', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(1)).doReturn(2);
        mocker.whenCalledWith(is(2)).doReturn(3);

        assertThat(mocker(3), is(99));
    });

    it('given a spyMock learning some calls, it returns the result of the first matched learning', function () {
        let mocker = spy(() => 99);

        mocker.whenCalledWith(is(1)).doReturn(2);
        mocker.whenCalledWith(is(2)).doReturn(3);

        assertThat(mocker(2), is(3));
    });

    it('given a spyMock learning a call that throws, calling the function that does not match does not throw', function () {
        let mocker = spy();

        mocker.whenCalledWith(is(0)).doThrow('nope');

        mocker(1);
    });

    it('given a spyMock learning a call that throws, calling the function that matches throws the error', function () {
        let mocker = spy();

        mocker.whenCalledWith(is(0)).doThrow('nope');

        let thrownError;
        try {
            mocker(0);
        } catch (error) {
            thrownError = error;
        }

        assertThat(thrownError, is('nope'));
    });

    it('given a spyMock learning a return and a throw, calling with the returning does not throw', function () {
        let mocker = spy();

        mocker.whenCalledWith(is(0)).doThrow('nope');
        mocker.whenCalledWith(is(2)).doReturn(6);

        assertThat(mocker(2), is(6));
    });

    it('given a spyMock learning the same call twice returns the result of the first learned match', function () {
        let mocker = spy();

        mocker.whenCalledWith(is(1)).doReturn('a');
        mocker.whenCalledWith(is(1)).doReturn('b');

        assertThat(mocker(1), is('a'));
    });
});
