// removeduplicates
// groupBy
// sortBy
// chunkArray
// shuffleArray
// first and last
// include
// count
//remove
// remove at

function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, item) => item !== index);
}

function removeFirst<T>(arr: T[]): T[] {
  return arr.slice(0);
}

function removeLast<T>(arr: T[]): T[] {
  return arr.slice(0, -1);
}
function removeNull<T>(arr: T[]): T[] {
  return arr.filter((item): item is T => item == null);
}

function removeUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== undefined);
}

function removeFalsy<T>(arr: (T | null | undefined | false | "" | 0)[]): T[] {
  return arr.filter(Boolean) as T[];
}

// inserting

function append<T>(arr: T[], value: T): T[] {
  return [value, ...arr];
}

function prepand<T>(arr: T[], value: T): T[] {
  return [...arr, value];
}

function insertAt<T>(arr: T[], index: number, value: T): T[] {
  return [...arr.slice(0, index), value, ...arr.slice(index)];
}

// rearranging

function swap<T>(arr: T[], first: number, second: number): T[] {
  const result = [...arr];
  [result[first], result[second]] = [result[second], result[first]];
  return result;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

// filtering
function filterBy<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  return arr.filter(predicate);
}
const users = [
  { id: 1, name: "Kanvi", city: "Mumbai" },
  { id: 2, name: "Tanvi", city: "Delhi" },
];
console.log("filterBY");
filterBy(users, (user) => user.city === "Mumbai");
filterBy(users, (user) => user.id === 1);

function remove<T>(arr: T[], value: T): T[] {
  return arr.filter((item) => item !== value);
}

function contains<T>(arr: T[], value: T): boolean {
  return arr.includes(value);
}

function count<T>(arr: T[], value: T): number {
  return arr.filter((item) => item == value).length;
}

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
console.log(removeDuplicates([1, 2, 2, 3]));

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
console.log(chunkArray([1, 2, 3, 4, 5], 2));

function shuffleArray<T>(arr: T[]): T[] {
  const shuffle = [...arr];
  for (let a = shuffle.length - 1; a > 0; a--) {
    const j = Math.floor(Math.random() * (a + 1));
    [shuffle[a], shuffle[j]] = [shuffle[j], shuffle[a]];
  }
  return shuffle;
}

function groupBy<T, K extends keyof T>(arr: T[], key: K): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const item of arr) {
    const group = String(item[key]);
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(item);
  }
  return grouped;
}

enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export function sortBy<T, K extends keyof T>(
  arr: T[],
  key: K,
  order: SortOrder = SortOrder.ASC,
): T[] {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) {
      return order === SortOrder.ASC ? -1 : 1;
    }

    if (a[key] > b[key]) {
      return order === SortOrder.ASC ? 1 : -1;
    }

    return 0;
  });
}

function frequency(arr: string[]): Record<string, number> {
  const count: Record<string, number> = {};
  for (const item of arr) {
    count[item] = (count[item] || 0) + 1;
  }
  return count;
}
console.log("freuency:- ", frequency(["A", "B", "A", "C", "A", "B"]));

type Student = {
  id: number;
  name: string;
};
const student: Partial<Student> = {
  name: "Kanvi",
};
console.log("partial", student);

// readonly
function read<T>(arr: Readonly<T[]>): T | undefined {
  return arr[0];
}

let numbers = [10, 20, 30, 40, 50];

console.log("Original:", numbers);

numbers = removeAt(numbers, 2);
console.log("removeAt:", numbers);

numbers = append(numbers, 60);
console.log("append:", numbers);

numbers = prepand(numbers, 5);
console.log("prepand:", numbers);

numbers = insertAt(numbers, 2, 15);
console.log("insertAt:", numbers);

numbers = swap(numbers, 0, 3);
console.log("swap:", numbers);

numbers = move(numbers, 4, 1);
console.log("move:", numbers);

numbers = remove(numbers, 40);
console.log("remove:", numbers);

console.log("remove first :-", removeFirst(numbers));
console.log("Remove last", removeLast(numbers));

console.log("contains 60:", contains(numbers, 60));
console.log("count 20:", count(numbers, 20));
console.log("first:", first(numbers));
console.log("last:", last(numbers));

console.log("readOnly:-", read(numbers));
console.log("shuffleArray:", shuffleArray(numbers));
console.log("chunkArray:", chunkArray(numbers, 3));

console.log(
  "removeUndefined:",
  removeUndefined([10, undefined, 20, undefined, 30]),
);

console.log("removeNull:", removeNull([10, null, 20, null, 30]));

console.log(
  "removeFalsy:",
  removeFalsy([10, 0, 20, false, 30, "", null, undefined]),
);

console.log("readOnly:", read(numbers));
