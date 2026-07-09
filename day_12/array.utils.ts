// removeduplicates
// groupBy
// sortBy
// chunkArray
// shuffleArray
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
