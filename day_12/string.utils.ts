// capitalize();
// reverse();
// truncate();
// camelCase();
// isPalindrome();

function capitalize(str: string): string {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}

function rev(str: string): string {
  return str.split("").reverse().join("");
}

function truncate(str: string): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + "...";
}

function camelCase(str: string): string {
  const word = str.toLowerCase().split(" ");

  return word
    .map((word, index) => {
      if (index == 0) {
      }
      return word[0].toUpperCase + word.slice(1);
    })
    .join("");
}

function isPalindrome(str: string): boolean {
  const text = str.toLowerCase();
  return text === text.split("").reverse().join("");
}

type Employee = {
  id: number;
  name: string;
  city: string;
  salary: number;
};
type EmployeeBasic = Pick<Employee, "id" | "name">;
const employee: EmployeeBasic = {
  id: 1,
  name: "Kanvi",
};
console.log(employee);

type Emp = {
  id: number;
  name: string;
  city: string;
  salary: number;
};

type EmployeeWithoutSalary = Omit<Employee, "salary">;
const emp: EmployeeWithoutSalary = {
  id: 1,
  name: "Kanvi",
  city: "Mumbai",
};

console.log(emp);

function filterBy<T>(arr: T[], key: string, value: unknown): T[] {
  return arr.filter((item) => (item as any)[key] === value);
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
