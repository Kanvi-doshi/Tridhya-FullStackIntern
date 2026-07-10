"use strict";
// capitalize();
// reverse();
// truncate();
// camelCase();
// isPalindrome();
function capitalize(str) {
    if (!str)
        return "";
    return str[0].toUpperCase() + str.slice(1);
}
function rev(str) {
    return str.split("").reverse().join("");
}
function truncate(str, length) {
    if (str.length <= length) {
        return str;
    }
    return str.slice(0, length) + "...";
}
function camelCase(str) {
    const word = str.toLowerCase().split(" ");
    return word
        .map((word, index) => {
        if (index == 0) {
        }
        return word[0].toUpperCase() + word.slice(1);
    })
        .join("");
}
function isPalindrome(str) {
    const text = str.toLowerCase();
    return text === text.split("").reverse().join("");
}
const employee = {
    id: 1,
    name: "Kanvi",
};
console.log(employee);
const emp = {
    id: 1,
    name: "Kanvi",
    city: "Mumbai",
};
console.log(emp);
function filterBy(arr, key, value) {
    return arr.filter((item) => item[key] === value);
}
console.log("FilterBy");
const users = [
    { id: 1, name: "Kanvi", city: "Mumbai" },
    { id: 2, name: "Rahul", city: "Delhi" },
];
filterBy(users, "city", "Mumbai");
const text = "hello world";
console.log("capitalize");
console.log(capitalize(text));
console.log("reverse");
console.log(rev(text));
console.log("truncate");
console.log(truncate(text, 5));
console.log("camelCase");
console.log(camelCase(text));
console.log("isPalindrome");
console.log(isPalindrome(text));
console.log(isPalindrome("madam"));
