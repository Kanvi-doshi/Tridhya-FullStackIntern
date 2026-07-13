//   Partial
//   Required
//   Readonly

interface User {
  id: number;
  name: string;
  age: number;
}
type UpdateUser1 = Partial<User> & Readonly<Required<Pick<User, "id">>>;
const user2: UpdateUser1 = {
  id: 1,
};
const user3: UpdateUser1 = {
  id: 2,
  name: "Kanvi",
};
const user4: UpdateUser1 = {
  id: 3,
  age: 22,
};
console.log("User 1:", user2);
console.log("User 2:", user3);
console.log("User 3:", user4);

//   Pick and omit
interface User {
  name: string;
  email: string;
  password: string;
}
// type UserProfile = Pick<User, "name" | "email">;
type UserProfile = Pick<Omit<User, "password">, "name" | "email">;
const profile: UserProfile = {
  name: "Kanvi",
  email: "kan@gmail.com",
};
console.log("Pick and omit[password]:-", profile);

//   Record
type StudentMarks = Record<string, number>;
const marks: StudentMarks = {
  Math: 95,
  Science: 90,
};
console.log("Record: ", marks);

// exclude
type Role = "Admin" | "User" | "Guest";
type AllowedRole = Exclude<Role, "Guest">;
const role: AllowedRole = "Admin"; //Remove guest
// const role: AllowedRole = "Guest";  Error
console.log("Exclude", role);

// extract
type Role1 = "Admin" | "User" | "Guest";
type AdminRole = Extract<Role, "Admin">; // Keep only "Admin"
const role1: AdminRole = "Admin";
// const role: AdminRole = "User"; Error
console.log("Extract: ", role1);

// non nullable
type Data = string | null | undefined;
type UserName = NonNullable<Data>; //remove null and undefined
const name1: UserName = "Kanvi";
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
// Extract the return type of getUser()
type User6 = ReturnType<typeof getUser1>;
const user6: User6 = {
  id: 2,
  name: "Rahul",
  age: 25,
};
console.log("ReturnType:- ", user6);

// parameters
function createUser(name: string, age: number) {
  return { name, age };
}
type UserParams = Parameters<typeof createUser>;
// UserParams becomes:- [string, number]
const user7: UserParams = ["Kanvi", 22];
console.log("Parameters", user7);

// constructor parameters
class User {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
// Extract constructor parameter types
type UserParam = ConstructorParameters<typeof User>; // UserParams becomes:- [string, number]
const user8: UserParams = ["Kanvi", 22];
console.log("ConstructorParameters", user8);

// instance types
class User9 {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
// Extract the instance type of User
type UserInstance = InstanceType<typeof User9>;
// Create an object of that type
const user9: UserInstance = new User9("Kanvi", 22);
console.log("InstanceType", user9);

// awaited
async function getUser() {
  return {
    id: 1,
    name: "Kanvi",
    age: 22,
  };
}
// Extract the resolved type of the Promise
type User10 = Awaited<ReturnType<typeof getUser>>;
// Create an object of the extracted type
const user10: User10 = {
  id: 2,
  name: "Rahul",
  age: 25,
};
console.log("Awaited", user10);
