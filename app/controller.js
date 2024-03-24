import { Encoder } from "./encoder.js";
import { RespType, RespValue } from "./resp.js";
export class Controller {
    cmd;
    args;
    store;
    constructor(value, store) {
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
    handleSet() {
        const [key, value] = this.args;
        this.store.set(key, value);
        return Encoder.encode("OK");
    }
    handleEcho() {
        return Encoder.encode(this.args.join(" "));
    }
    handlePing() {
        return Encoder.encode("PONG");
    }
    handleGet() {
        let [key] = this.args;
        let value = this.store.get(key);
        if (value)
            return Encoder.encode(value);
        return Encoder.encode(RespValue.Nil, RespType.BulkString);
    }
}
