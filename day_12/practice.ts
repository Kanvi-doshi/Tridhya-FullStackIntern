const a: number = 21;
const b: number[] = [];
let c = [{ id: 101 }, { name: "abc" }];
type c = {
  id: number;
  name: string;
};

let user: c = {
  name: "abc",
  id: 101,
};

// tuple
let point: [number, number] = [10, 10];

// function
function add(a: number, b: number): number {
  return a + b;
}
// var storing a function
const greet: (name: string) => void = (names) => {
  console.log(names);
};

// union types
let id: number | string;
id = 10;
id = "k";

// literal types
let status: "success" | "error";
status = "success";
status = "error";

// record=> when keys are unknown but values are the same type

let score: Record<string, number> = {
}

// map
