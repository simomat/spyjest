export const zipLimitFirst = (first, second) => {
    let zipped = [];
    for (let i = 0; i < first.length; i++) {
        zipped.push([first[i], second[i]]);
    }
    return zipped;
};

export const allMatchersApply = (matchers, args) =>
    zipLimitFirst(matchers, args)
        .every(([expected, actual]) => expected.matches(actual));