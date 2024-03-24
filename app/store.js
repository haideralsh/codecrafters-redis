export class Store {
    data;
    constructor() {
        this.data = new Map();
    }
    set(key, value, timeToLive) {
        this.data.set(key, value);
        if (timeToLive) {
            setTimeout(() => {
                this.delete(key);
            }, timeToLive);
        }
    }
    get(key) {
        return this.data.get(key);
    }
    delete(key) {
        this.data.delete(key);
    }
}
