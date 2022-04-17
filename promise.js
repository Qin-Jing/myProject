var a = function() {
	return "a";
};
var b = function() {
	console.log("b");
};
var c = function() {
	return new Promise((resolve, reject) => {
		console.log("c");
		if (a() !== "a") {
			resolve("successed");
		} else {
			reject("failed");
		}

	});
};
c().then(result => {
	console.log(result);
}).catch(result => {
	console.log(result);
});
let promise = new Promise(function(resolve, reject) {
	console.log('Promise');
	resolve();
	reject(); //Promise 的状态一旦改变，就永久保持该状态，不会再变了
});

promise.then(function() {
	console.log('resolved.');
}).catch(result => {
	console.log(result);
});

console.log('Hi!');


// 写法一
const promise2 = new Promise(function(resolve, reject) {
	try {
		throw new Error('test');
	} catch (e) {
		reject(e);
	}
});
promise2.catch(function(error) {
	console.log(error);
});

// 写法二
const promise1 = new Promise(function(resolve, reject) {
	reject(new Error('test1'));
});
promise1.catch(function(error) {
	console.log(error);
});


function timeout(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function asyncPrint(value, ms) {
	console.log("value");
	await timeout(ms);
	console.log(value);
}

asyncPrint('hello world', 5000);