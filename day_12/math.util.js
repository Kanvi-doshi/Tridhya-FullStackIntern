"use strict";
function sum(numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}
function average(numbers) {
    return sum(numbers) / numbers.length;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function percentage(value, total) {
    return (value / total) * 100;
}
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function max(numbers) {
    return Math.max(...numbers);
}
function min(numbers) {
    return Math.min(...numbers);
}
function factorial(num) {
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    return result;
}
function isPrime(num) {
    if (num < 2) {
        return false;
    }
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}
function roundTo(value, decimals) {
    return Number(value.toFixed(decimals));
}
const numbers = [10, 20, 30, 40, 50];
console.log("sum:", sum(numbers));
console.log("average:", average(numbers));
console.log("clamp:", clamp(15, 1, 10));
console.log("percentage:", percentage(45, 50));
console.log("randomNumber:", randomNumber(1, 100));
console.log("max:", max(numbers));
console.log("min:", min(numbers));
console.log("factorial:", factorial(5));
console.log("isPrime:", isPrime(17));
console.log("roundTo:", roundTo(3.1415926, 2));
