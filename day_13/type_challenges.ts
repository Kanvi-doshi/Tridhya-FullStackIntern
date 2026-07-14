const u = {
  id: 1,
  name: "Kanvi",
  age: 22,
};
function updateProperty<T>(obj: T, key: keyof T, value: T[keyof T]): T {
  return { ...obj, [key]: value };
}
console.log(updateProperty(u, "name", "Rahul"));

//  type of
const product = {
  id: 1,
  name: "Laptop",
  price: 50000,
};
type Product = typeof product;
const product2: Product = {
  id: 2,
  name: "Phone",
  price: 25000,
};

// indexed array type
interface Student {
  id: number;
  name: string;
  marks: number;
}
function printMarks(marks: Student["marks"]) {
  console.log("indexed array type: ", marks);
}
printMarks(24);

// union type
type Search = number | string;

function search(value: Search) {
  console.log("union:- ", value);
}
search(101);

// intersection
interface Person {
  name: string;
}
interface Employ {
  salary: number;
}
type Staff = Person & Employ;

type Theme = "light" | "dark"; //type Theme = | "light"| "dark";
function changeTheme(theme: Theme) {
  console.log("theme", theme);
}
changeTheme("dark");

// type asserations-DOM
// const input = document.getElementById("name") as HTMLInputElement;
// input.value = "Kanvi";
// console.log("Dom:-", input.value);

// types guard
function calculate(value: number | string) {
  if (typeof value === "number") {
    return value * 2;
  }
  return value.toUpperCase();
}
console.log("typeof guard", calculate(5));
console.log("typeof guard", calculate("kanvi"));

// mapped types
interface User01 {
  id: number;
  name: string;
  age: number;
  email: string;
}
type Editable<T> = {
  [K in keyof T]?: T[K];
};
type UpdateUser01 = Editable<User>;
const user: User01 = {
  id: 1,
  name: "Kanvi",
  age: 22,
  email: "ka@gmail.com",
};

const updates: UpdateUser01 = { name: "Rahul" };
function updateUser(user: User01, updates: UpdateUser01): User01 {
  return { ...user, ...updates };
}
const updatedUser = updateUser(user, updates);
console.log(updatedUser);

// conditional types

type example<T> = T extends "user"
  ? {
      id: number;
      name: string;
      age: number;
    }
  : {
      id: number;
      title: string;
      price: number;
    };

const user1: example<"user"> = {
  id: 1,
  name: "Kanvi",
  age: 22,
};
const product1: example<"product"> = {
  id: 101,
  title: "Laptop",
  price: 75000,
};

console.log("Conditional Type");
console.log(user1);
console.log(product1);

// infer- automatically get the return type[u dont to write type kids seperately ]
function getUser11() {
  return {
    id: 1,
    name: "Kanvi",
  };
}
type MyReturn<T> = T extends (...args: any[]) => infer R ? R : never;
type kids = MyReturn<typeof getUser11>;
const student: kids = getUser11();

console.log("Infer");
console.log(student);

// template
type ButtonVariant = "primary" | "secondary" | "success" | "danger";
type ButtonClass = `btn-${ButtonVariant}`;
const btn1: ButtonClass = "btn-primary";
const btn2: ButtonClass = "btn-success";
const btn3: ButtonClass = "btn-danger";

// const btn: ButtonClass = "button-primary";
// Type '"button-primary"' is not assignable to type '"btn-primary"...., Did you mean '"btn-primary"'?

console.log("Template Literal Types");
console.log(btn1);
console.log(btn2);
console.log(btn3);

// Recursive Types
type Folder = {
  name: string;
  children: Folder[]; // [] represents recursive
};
const project: Folder = {
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

// recursive [2]
// ====================================
// Recursive Comments
// ====================================

type Comment1 = {
  user3: string;
  message: string;
  replies: Comment1[];
};

const post: Comment1 = {
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
