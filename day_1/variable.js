//1 var, let, const :-
var name='K';
let middlename='s';
const surname='D';
console.log(`my name is ${name} ${middlename} ${surname}.`);

// 2
let firstName = "Kanvi";
let lastName = "Doshi";

console.log(firstName + " " + lastName);


//3
// Updating variables
// Mutable vs immutable variables
// const error
let score =50;
console.log(score +40);
console.log(score - 40);
// const score1 =50;
// score1 = score1 +40;
// console.log(score1); // assignment to constant variable

// 4
// Undefined vs Null
let b;
let c =null;
console.log(typeof(b));
console.log(typeof(c)); 


// 5 let [blocked scope]
let a=10
{
    let a=20;
    console.log("block a:-",a);
}
console.log("a:-",a);

// const[blocked scope]
const d =10;
{
    const d=20;
    console.log("block d:-",d);
}
console.log("d:-",d);

// var[global scope]
var e =10;
{
    var e=20;
    console.log("block e:-",e);
}
console.log("e:-",e);

// 6 swap using three variables
let k=20;
let f= 10;
console.log("before swap:-",k,f);
let temp=k;
k=f;
f=temp;
console.log("after swap:-",k,f);