function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

function average(numbers: number[]): number {
  return sum(numbers) / numbers.length;
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function percentage(value: number, total: number): number {
  return (value / total) * 100;
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function max(numbers: number[]): number {
  return Math.max(...numbers);
}

function min(numbers: number[]): number {
  return Math.min(...numbers);
}

function factorial(num: number): number {
  let result = 1;
  for (let i = 2; i <= num; i++) {
    result *= i;
  }
  return result;
}

function isPrime(num: number): boolean {
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

function roundTo(value: number, decimals: number): number {
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
