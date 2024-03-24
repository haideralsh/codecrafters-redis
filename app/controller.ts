import { Encoder } from "./encoder.js";
import { RespType, RespValue } from "./resp.js";
import { Store } from "./store.js";

export class Controller {
  private cmd: string;
  private args: string[];
  private store: Store;

  constructor(value: any[], store: Store) {
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
    }
  }

  private handleSet() {
    const [key, value] = this.args;
    this.store.set(key, value);

    return Encoder.encode("OK");
  }

  private handleEcho() {
    return Encoder.encode(this.args.join(" "));
  }

  private handlePing() {
    return Encoder.encode("PONG");
  }

  private handleGet() {
    let [key] = this.args;
    let value = this.store.get(key);
    if (value) return Encoder.encode(value);

    return Encoder.encode(RespValue.Nil, RespType.BulkString);
  }
}
