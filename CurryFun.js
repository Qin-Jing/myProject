function add(a, b) {
    return a + b;
}
const curry = (fn, ...arg) => {
	console.log(arg)
    let all = arg;
    return (...rest) => {
        all.push(...rest);
        return fn.apply(null, all);
    }
}
let add2 = curry(add, 2)
console.log(add2(8));    //10
// add2 = curry(add);
// console.log(add2(2,8)); //10