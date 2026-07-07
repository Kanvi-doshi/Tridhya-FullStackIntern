// ####                              call stack
// function a() {
//   console.log("A");
// }
// function b() {
//   a();
//   console.log("B");
// }
// console.log("Start");
// b();
// console.log("End");

// ######                            set timeout
// console.log("1");
// setTimeout(() => {
//   console.log("2");
// }, 0);
// console.log("3"); 

// #######                             Promises
// console.log("1");
// Promise.resolve().then(() => {
//   console.log("2");
// });
// console.log("3");


// #########################            question
// console.log("1");
// setTimeout(() => console.log("2"), 0);
// Promise.resolve().then(() => console.log("3"));
// console.log("4");

// #########################              question
// console.log("A");
// Promise.resolve().then(() => {
//   console.log("B");
//   Promise.resolve().then(() => {
//     console.log("C");
//   });
// });
// console.log("D");

// #########################               question
// console.log("A");
// setTimeout(() => {
//   console.log("B");
// }, 0);
// console.log("C");

// #########################                  question
// console.log("1");
// setTimeout(() => {
//   console.log("2");
// }, 0);
// Promise.resolve().then(() => {
//   console.log("3");
// });
// console.log("4");

// #########################                question
// console.log(1);
// const promise = new Promise((resolve) => {
//   console.log(2);
//   resolve();
//   console.log(3);
// });
// console.log(4);
// promise
//   .then(() => {
//     console.log(5);
//   })
//   .then(() => {
//     console.log(6);
//   });
// console.log(7);
// setTimeout(() => {
//   console.log(8);
// }, 10);
// setTimeout(() => {
//   console.log(9);
// }, 0);

// #########################                question

// new Promise((resolve, reject) => {
//   resolve(1);
//   resolve(2);
//   reject("error");
// }).then(
//   (value) => {
//     console.log(value);
//   },
//   (error) => {
//     console.log("error");
//   },
// );

// #########################                  question

// Promise.resolve(1) 
//   .then(() => 2) 
//   .then(3) 
//   .then((value) => value * 3) 
//   .then(Promise.resolve(4)) 
//   .then(console.log);

// #########################          question
// console.log("A");

// Promise.resolve().then(() => {
//   console.log("B");

//   Promise.resolve().then(() => {
//     console.log("C");
//   });

//   queueMicrotask(() => {
//     console.log("D");
//   });

//   console.log("E");
// });

// queueMicrotask(() => {
//   console.log("F");

//   Promise.resolve().then(() => {
//     console.log("G");
//   });
// });

// setTimeout(() => {
//   console.log("H");
// }, 0);

// console.log("I");

//  ######################            question
// console.log("start");
// setTimeout(() => {
//   console.log("t1");
//   process.nextTick(() => console.log("nt1"));
//   Promise.resolve().then(() => {
//     console.log("p1");
//     setImmediate(() => console.log("i1"));
//   });
//   setTimeout(() => console.log("t2"), 0);
// }, 0);
// setImmediate(() => {
//   console.log("i2");
//   Promise.resolve().then(() => console.log("p2"));
// });
// Promise.resolve().then(() => {
//   console.log("p3");
//   process.nextTick(() => console.log("nt2"));
// });
// process.nextTick(() => {
//   console.log("nt3");
//   Promise.resolve().then(() => console.log("p4"));
// });
// console.log("end");
