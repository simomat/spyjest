# spyjest

Verify and mock function calls with [hamjest](https://github.com/rluba/hamjest) matchers.

Contents
 * [spy/assert examples](#examples---the-spy-part)
 * [mock examples](#examples-for-mocks)
 * [API documentation](#api-documentation)

##### Function verification - what it is good for:
 * verify function calls: how many calls, which arguments
 * utilize hamcrest style assertions using matchers (compact self-describing expressions of expectation)
 * reuse existing matchers of hamjest or write your own matchers - see [matcher doc](https://github.com/rluba/hamjest/wiki/Matcher-documentation) for details
 * and the real benefit (that applies for hamjest in general):
    * write readable tests
    * get a useful description of why a test failed,
    * make fixing a test easier

##### But wait, it also provides clean and expressive mocking:
 * specify what the function should return in general
 * specify what the function should return when called with specific arguments
 * use hamjest matchers to express function call arguments

And finally, the syntax will be familiar to you if you come from Java and know how to write tests with mockito and hamcrest.

### Examples - the spy part

```javascript
let spyFunction = spy();                    // create the a spy function

someProductiveFunction(spyFunction);        // pass it elsewhere

assertThat(spyFunction, wasCalled());       // check it was called internally
assertThat(spyFunction, wasNotCalled());    // or maybe check it was not called
```

One of the assertions will fail. Let's check the output:
```
AssertionError:
Expected: a function that was not called
     but: was called 1 time
```

Express how often a function should be called.
```javascript
let fun = spy();
fun(); fun(); fun();                    // say it was called 3 times
assertThat(fun, wasCalled().times(2));  // but actually it should be called 2 times
```
You will see:
```
AssertionError:
Expected: a function that was called 2 times
     but: was called 3 times
```

One simple example that shows how to check a function was called with a specific argument:
```javascript
let fn = spy();
fn(42); fn(42); fn('wat'); fn('wat'); fn(); fn('42', {a: [1,2,3]});
assertThat(fn, wasCalledWith(42).times(3));  // called with 42 three times
```
Will yield:
```
AssertionError:
Expected: a function that was called 3 times with arguments: <42>
     but: was called 2 times with expected arguments; and was also called
            2 times with: ("wat")
            1 time  with: ()
            1 time  with: ("42", {"a":[1,2,3]})
```

One key feature is that you can use matchers to express expectations of call arguments. They make your tests more readable, can easily be reused across tests and produce a verbose description of an expectation that has not been met. This can make writing and fixing tests much easier:
```javascript
let fn = spy();

fn(42, [1, 2, 3]);
fn(42, [2, 33, 44]);
fn(42, ['a', 33, 2]);

assertThat(fn, wasCalledWith(anything(), hasItem('a')));  // passes
assertThat(fn, wasCalledWith(42, hasItem(2)).times(2));   // fails
```
Will give you:
```
AssertionError:
Expected: a function that was called 2 times with arguments: <42>, an array containing <2>
     but: was called 3 times with expected arguments; and no other call was made
```

If you wonder where `anything()` and `hasItem()` matchers come from, which other matchers exist or how to write matchers, see [documentation for existing matchers](https://github.com/rluba/hamjest/wiki/Matcher-documentation) or [how to write custom masters](https://github.com/rluba/hamjest/wiki/Custom-matchers).

### Examples for mocks

The  `spy()` object also offers ways to specify what to return inside production code if called with specific arguments.


```javascript
// spy can just wrap a dummy (or production) function that is called whenever the spy is called.
let fn = spy(x => x + 5);

fn(10); // will return 15

// additionally when called with 0, it returns -6
fn.whenCalledWith(0).doReturn(-6);

// use matchers to express arguments
fn.whenCalledWith(hasItem(5)).doReturn(0);

fn([3, 4, 5, 6]); // returns 0 because the array contains 5

// match more than one argument
fn.whenCalledWith(is(2), undef(), hasItem(2)).doReturn(100);

// let the mock throw an error under some circumstances
fn.whenCalledWith(undef(), 'snafu').doThrow('wow, undefined');
```


### API documentation

#### `wasCalled()`

Returns a [FunctionMatcher](#functionmatcher) object that matches a given [spy function](#spydefaultfunction) if it was called.  
It takes no arguments.

#### `wasNotCalled()`

Returns a [FunctionMatcher](#functionmatcher) object that matches a given [spy function](#spydefaultfunction) if it was not called.  
It takes no arguments.  
Implementation hint: it is a shortcut for `wasCalled().times(0)`.

#### `wasCalledWith([arg1, arg2, ...])`

Returns a [FunctionMatcher](#functionmatcher) object that matches a given [spy function](#spydefaultfunction) if it was called with matching arguments.  
It takes zero, one or many arguments where an argument can be
 * a [matcher](https://github.com/rluba/hamjest/wiki/Matcher-documentation) that should match one call argument
 * any value that should be deep equal to one call argument.

#### `spy([defaultFunction])`

Returns a spy function.  
A spy function records the number of calls and arguments it was called with. Validation is performed using a [FunctionMatcher](#functionmatcher).  

When a `defaultFunction` is given as an argument, calls of the spy function are delegated to that given function and the result is returned.  
If no function is passed as an argument, the spy function returns `undefined` when it is called.

##### `spyFunction.whenCalledWith([arg1, arg2, ...]).doReturn(returnValue)`

Trains the spy function to return `returnValue` when it is called with arguments that match `arg1, arg2, ...`. Match rules and argument types are the same as in [`wasCalledWith()`](#wascalledwitharg1-arg2-).

##### `spyFunction.whenCalledWith([arg1, arg2, ...]).doThrow(error)`

Trains the spy function to throw `error` when it is called with arguments that match `arg1, arg2, ...`. Match rules and argument types are the same as in [`wasCalledWith()`](#wascalledwitharg1-arg2-).

##### Multiple or no call matches with `whenCalledWith()`

When the spy function is called with arguments that would match more than one trained result using `whenCalledWith()`, the first trained result applies.  
When the spy function is called and it does not match a trained result using `whenCalledWith()`, the call is delegated to `defaultFunction` and its result is returned, or `undefined` returned if no `defaultFunction` was specified.

#### `FunctionMatcher`

A matcher class that matches number of calls and/or call arguments of a given [spy function](#spydefaultfunction).  
Instances are created with one of the creator functions (see above).

##### `FunctionMatcher.prototype.times(numberOfCalls)`  

Sets the expected number of calls (integer) of a [spy function](#spydefaultfunction).  
It returns the current FunctionMatcher object.

These methods are part of [matchers](https://github.com/rluba/hamjest/wiki/Custom-matchers#matcher-requirements) and are meant for internal use:  
`FunctionMatcher.prototype.matches(actual)`  
`FunctionMatcher.prototype.describeTo(description)`  
`FunctionMatcher.prototype.describeMismatch(actual, description)`  
