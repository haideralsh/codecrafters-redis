import { Encoder } from "./encoder.js";
import { parseOptions } from "./main.js";
import { Store } from "./store.js";

export class Controller {
  private cmd: string;
  private args: string[];
  private store: Store;

  constructor(value: string[], store: Store) {
    [this.cmd, ...this.args] = value;
    this.store = store;
  }

  handle() {
    switch (this.cmd) {
      case "ping":
        return this.handlePing();

      case "echo":
        return this.handleEcho();

      case "set":
        return this.handleSet();

      case "get":
        return this.handleGet();

      case "info":
        return this.handleInfo();
    }
  }

  private handleGet() {
    let [key] = this.args;
    let value = this.store.get(key);
    if (value) return Encoder.simpleString(value);

    return Encoder.nil();
  }

  private handleSet() {
    const [key, value, ...opts] = this.args;

    if (opts.length === 0) {
      this.store.set(key, value);
      return Encoder.simpleString("OK");
    }

    let [opt, optVal] = opts;
    switch (opt) {
      case "px":
        let timeToLive = parseInt(optVal);
        this.store.set(key, value, timeToLive);
    }

    return Encoder.simpleString("OK");
  }

  private handleEcho() {
    return Encoder.simpleString(this.args.join(" "));
  }

  private handlePing() {
    return Encoder.simpleString("PONG");
  }

  private handleInfo() {
    let {
      replicaof: [masterHost],
    } = parseOptions();

    return masterHost
      ? Encoder.bulkString("role:slave")
      : Encoder.bulkString("role:master");
  }
}
