import { Cli } from "./cli.js";
import { Encoder } from "./encoder.js";
export class Controller {
    cmd;
    args;
    store;
    cli;
    constructor(value, store, cli) {
        [this.cmd, ...this.args] = value;
        this.store = store;
        this.cli = new Cli();
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
    handleEcho() {
        return Encoder.simpleString(this.args.join(" "));
    }
    handlePing() {
        return Encoder.simpleString("PONG");
    }
    handleGet() {
        let [key] = this.args;
        let value = this.store.get(key);
        if (value)
            return Encoder.simpleString(value);
        return Encoder.nil();
    }
    handleSet() {
        const [key, value, ...opts] = this.args;
        let [opt, optVal] = opts;
        switch (opt) {
            case "px":
                let timeToLive = parseInt(optVal);
                this.store.set(key, value, timeToLive);
            default:
                this.store.set(key, value);
        }
        return Encoder.simpleString("OK");
    }
    handleInfo() {
        let replicaof = this.cli.replicaof;
        if (replicaof) {
            let [masterHost] = this.cli.replicaof;
            return Encoder.bulkString("role:slave", "master_repl_offset:0", "master_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb");
        }
        return Encoder.bulkString("role:master", "master_repl_offset:0", "master_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb");
    }
}
