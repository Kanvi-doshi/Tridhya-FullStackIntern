function omitKeys<T>(obj: T, keys: string[]): Partial<T> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key as keyof T];
  }
  return result;
}

// Merge two objects
function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
  return {
    ...obj1,
    ...obj2,
  };
}

function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// Swap keys and values
function invertObject(
  obj: Record<string, string | number>,
): Record<string, string> {
  const result: Record<string, string> = {};

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