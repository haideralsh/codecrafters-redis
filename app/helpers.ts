export function chunk<T>(arr: T[], size: number) {
  if (size <= 0) return [];
  if (size >= arr.length) return [arr];
  let chunks = [];
  let index = 0;
  while (index < arr.length) {
    chunks.push(arr.slice(index, index + size));
    index += size;
  }
  return chunks;
}
