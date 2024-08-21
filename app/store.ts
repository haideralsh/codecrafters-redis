export default class Store {
  private data: Map<string, string>;

  constructor() {
    this.data = new Map();
  }

  set(key: string, value: string, timeToLive?: number) {
    this.data.set(key, value);

    if (timeToLive) {
      setTimeout(() => {
        this.delete(key);
      }, timeToLive);
    }
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }
}
