export class Store {
  private data: Map<string, string>;

  constructor() {
    this.data = new Map();
  }

  set(key: string, value: string) {
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }
}
