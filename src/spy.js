export function spy(callable) {
    let calls = [];
    let spy = function () {
        calls.push(Array.from(arguments));
        return callable(...arguments);
    };
    spy.__calls = calls;
    return spy;
}
