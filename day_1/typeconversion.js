// 13 number to string, string to number, boolean to string
let a = "21";
let b = true;
let newA = Number(a);
let c = String(newA);
let newB = String(b);
console.log("a:", typeof a);
console.log("newA:", typeof newA);
console.log("c[string to number]:", typeof c);
console.log("b:", typeof b);
console.log("newB:", typeof newB);

// 14 coversion of null and undefined to string [no change]
let d = null;
let e;
console.log("d:-", String(d));
console.log("e:-", String(e));

//  15 conversion to boolean
console.log(Boolean(0));
console.log(Boolean(1));
console.log(Boolean(""));
console.log(Boolean("JavaScript"));

//  string to number
console.log(Number("Hello"));

// bigInt to number, parseInt, parseFloat
let K = "123abc";
console.log(Number(K));
console.log(parseInt(K));
console.log(parseFloat(K));
