"use strict";
function omitKeys(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
// Merge two objects
function mergeObjects(obj1, obj2) {
    return {
        ...obj1,
        ...obj2,
    };
}
function deepClone(obj) {
    return structuredClone(obj);
}
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}
// Swap keys and values
function invertObject(obj) {
    const result = {};
    for (const key in obj) {
        result[String(obj[key])] = key;
    }
    return result;
}
const user = {
    id: 101,
    name: "Kanvi",
    age: 22,
    city: "Ahmedabad",
};
const extraInfo = {
    country: "India",
    profession: "Developer",
};
const grades = {
    Kanvi: "A",
    Rahul: "B",
    Priya: "C",
};
console.log("omitKeys:", omitKeys(user, ["age"]));
console.log("mergeObjects:", mergeObjects(user, extraInfo));
const clone = deepClone(user);
clone.name = "Rahul";
console.log("deepClone:", clone);
console.log("isEmptyObject:", isEmptyObject(user));
console.log("isEmptyObject (empty):", isEmptyObject({}));
console.log("invertObject:", invertObject(grades));
