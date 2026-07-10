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
function removeAt(arr, index) {
    return arr.filter((_, item) => item !== index);
}
function removeFirst(arr) {
    return arr.slice(0);
}
function removeLast(arr) {
    return arr.slice(0, -1);
}
function removeNull(arr) {
    return arr.filter((item) => item == null);
}
function removeUndefined(arr) {
    return arr.filter((item) => item !== undefined);
}
function removeFalsy(arr) {
    return arr.filter(Boolean);
}
// inserting
function append(arr, value) {
    return [value, ...arr];
}
function prepand(arr, value) {
    return [...arr, value];
}
function insertAt(arr, index, value) {
    return [...arr.slice(0, index), value, ...arr.slice(index)];
}
// rearranging
function swap(arr, first, second) {
    const result = [...arr];
    [result[first], result[second]] = [result[second], result[first]];
    return result;
}
function move(arr, from, to) {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
}
// filtering
function filterBy(arr, predicate) {
    return arr.filter(predicate);
}
const users = [
    { id: 1, name: "Kanvi", city: "Mumbai" },
    { id: 2, name: "Tanvi", city: "Delhi" },
];
console.log("filterBY");
filterBy(users, (user) => user.city === "Mumbai");
filterBy(users, (user) => user.id === 1);
function remove(arr, value) {
    return arr.filter((item) => item !== value);
}
function contains(arr, value) {
    return arr.includes(value);
}
function count(arr, value) {
    return arr.filter((item) => item == value).length;
}
function first(arr) {
    return arr[0];
}
function last(arr) {
    return arr[arr.length - 1];
}
function removeDuplicates(arr) {
    return [...new Set(arr)];
}
console.log(removeDuplicates([1, 2, 2, 3]));
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}
console.log(chunkArray([1, 2, 3, 4, 5], 2));
function shuffleArray(arr) {
    const shuffle = [...arr];
    for (let a = shuffle.length - 1; a > 0; a--) {
        const j = Math.floor(Math.random() * (a + 1));
        [shuffle[a], shuffle[j]] = [shuffle[j], shuffle[a]];
    }
    return shuffle;
}
function groupBy(arr, key) {
    const grouped = {};
    for (const item of arr) {
        const group = String(item[key]);
        if (!grouped[group]) {
            grouped[group] = [];
        }
        grouped[group].push(item);
    }
    return grouped;
}
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (SortOrder = {}));
export function sortBy(arr, key, order = SortOrder.ASC) {
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
function frequency(arr) {
    const count = {};
    for (const item of arr) {
        count[item] = (count[item] || 0) + 1;
    }
    return count;
}
console.log("freuency:- ", frequency(["A", "B", "A", "C", "A", "B"]));
const student = {
    name: "Kanvi",
};
console.log("partial", student);
// readonly
function read(arr) {
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
console.log("removeUndefined:", removeUndefined([10, undefined, 20, undefined, 30]));
console.log("removeNull:", removeNull([10, null, 20, null, 30]));
console.log("removeFalsy:", removeFalsy([10, 0, 20, false, 30, "", null, undefined]));
console.log("readOnly:", read(numbers));
