"use strict";
//   Partial
//   Required
//   Readonly
const user2 = {
    id: 1,
};
const user3 = {
    id: 2,
    name: "Kanvi",
};
const user4 = {
    id: 3,
    age: 22,
};
console.log("User 1:", user2);
console.log("User 2:", user3);
console.log("User 3:", user4);
const profile = {
    name: "Kanvi",
    email: "kan@gmail.com",
};
console.log("Pick and omit[password]:-", profile);
const marks = {
    Math: 95,
    Science: 90,
};
console.log("Record: ", marks);
const role = "Admin"; //Remove guest
// const role: AllowedRole = "Guest";  Error
console.log("Exclude", role);
const role1 = "Admin";
// const role: AdminRole = "User"; Error
console.log("Extract: ", role1);
const name1 = "Kanvi";
// const name: UserName = null;        Error
// const name: UserName = undefined;   Error
console.log("NonNullable: ", name1);
// return type
function getUser1() {
    return {
        id: 1,
        name: "Kanvi",
        age: 22,
    };
}
const user6 = {
    id: 2,
    name: "Rahul",
    age: 25,
};
console.log("ReturnType:- ", user6);
// parameters
function createUser(name, age) {
    return { name, age };
}
// UserParams becomes:- [string, number]
const user7 = ["Kanvi", 22];
console.log("Parameters", user7);
// constructor parameters
class User {
    name;
    age;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
const user8 = ["Kanvi", 22];
console.log("ConstructorParameters", user8);
// instance types
class User9 {
    name;
    age;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
// Create an object of that type
const user9 = new User9("Kanvi", 22);
console.log("InstanceType", user9);
// awaited
async function getUser() {
    return {
        id: 1,
        name: "Kanvi",
        age: 22,
    };
}
// Create an object of the extracted type
const user10 = {
    id: 2,
    name: "Rahul",
    age: 25,
};
console.log("Awaited", user10);
