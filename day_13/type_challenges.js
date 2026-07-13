"use strict";
const u = {
    id: 1,
    name: "Kanvi",
    age: 22,
};
function updateProperty(obj, key, value) {
    return { ...obj, [key]: value };
}
console.log(updateProperty(u, "name", "Rahul"));
//  type of
const product = {
    id: 1,
    name: "Laptop",
    price: 50000,
};
const product2 = {
    id: 2,
    name: "Phone",
    price: 25000,
};
function printMarks(marks) {
    console.log("indexed array type: ", marks);
}
printMarks(24);
function search(value) {
    console.log("union:- ", value);
}
search(101);
function changeTheme(theme) {
    console.log("theme", theme);
}
changeTheme("dark");
// type asserations-DOM
// const input = document.getElementById("name") as HTMLInputElement;
// input.value = "Kanvi";
// console.log("Dom:-", input.value);
// types guard
function calculate(value) {
    if (typeof value === "number") {
        return value * 2;
    }
    return value.toUpperCase();
}
console.log("typeof guard", calculate(5));
console.log("typeof guard", calculate("kanvi"));
const user = {
    id: 1,
    name: "Kanvi",
    age: 22,
    email: "ka@gmail.com",
};
const updates = { name: "Rahul" };
function updateUser(user, updates) {
    return { ...user, ...updates };
}
const updatedUser = updateUser(user, updates);
console.log(updatedUser);
const user1 = {
    id: 1,
    name: "Kanvi",
    age: 22,
};
const product1 = {
    id: 101,
    title: "Laptop",
    price: 75000,
};
console.log("Conditional Type");
console.log(user1);
console.log(product1);
// infer- automatically get the return type[u dont to rite type kids seperately ]
function getUser() {
    return {
        id: 1,
        name: "Kanvi",
    };
}
const student = getUser();
console.log("Infer");
console.log(student);
const btn1 = "btn-primary";
const btn2 = "btn-success";
const btn3 = "btn-danger";
// const btn: ButtonClass = "button-primary";
// Type '"button-primary"' is not assignable to type '"btn-primary"...., Did you mean '"btn-primary"'?
console.log("Template Literal Types");
console.log(btn1);
console.log(btn2);
console.log(btn3);
const project = {
    name: "Project",
    children: [
        {
            name: "src",
            children: [
                {
                    name: "components",
                    children: [],
                },
                {
                    name: "pages",
                    children: [],
                },
            ],
        },
        {
            name: "public",
            children: [],
        },
    ],
};
console.log("Recursive Types");
console.log(project);
const post = {
    user3: "Kanvi",
    message: "TypeScript is awesome!3",
    replies: [
        {
            user3: "John",
            message: "Absolutely!",
            replies: [
                {
                    user3: "Alice",
                    message: "I agree!",
                    replies: [],
                },
            ],
        },
    ],
};
console.log(post);
3;
