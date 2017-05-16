# spyjest

Verify and mock function calls with [hamjest](https://github.com/rluba/hamjest) matchers.
 


Function verification - what it is good for:
 * verify function calls: how many calls, which arguments
 * utilize hamcrest style assertions using matchers (compact self-describing expressions of expectation)
 * reuse existing matchers of hamjest or write your own matchers - see [matcher doc](https://github.com/rluba/hamjest/wiki/Matcher-documentation) for details
 * and the real benefit (that applies for hamjest in general):
    * write readable tests
    * get a useful description of why a test failed,
    * make fixing a test easier

But wait, it also provides clean and expressive mocking:
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

Express expectation with matchers:
```javascript
let fn = spy();

fn(42, [1, 2, 3]);
fn(42, [2, 33, 44], 'dont mind me');
fn(42, ['a', 33, 2]);

assertThat(fn, wasCalledWith(anything(), hasItem('a')));  // passed
assertThat(fn, wasCalledWith(42, hasItem(2)).times(2));   // matcher for array content
```
Will give you:
```
AssertionError: 
Expected: a function that was called 2 times with arguments: <42>, an array containing <2>
     but: was called 3 times with expected arguments; and no other call was made
```

### Examples for mocks

The  `spy()` object also offers ways to specify what to return inside production code if called with specific arguments.


```javascript
// spy can just wrap a dummy (or production) function that is called whenever the spy is called.
let fn = spy(x => x + 5);

fn(10); // -> 15

// additionally when called with 0, it returns -6
fn.whenCalledWith(0).doReturn(-6);

// use matchers to express arguments
fn.whenCalledWith(hasItem(5)).doReturn(0);

fn([3, 4, 5, 6]); // -> 0

// match more than one argument
fn.whenCalledWith(is(2), undef(), hasItem(2)).doReturn(100);

// let the mock throw an error under some circumstances
fn.whenCalledWith(undef(), 'snafu').doThrow('wow, undefined');
```
