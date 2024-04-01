import { Encoder } from "./encoder.js";
import { EMPTY_RDB_FILE_HEX } from "./rdb.js";
const HARDCODED_REPL_ID = "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
export class CommandHandler {
    cmd;
    args;
    store;
    cliArgs;
    constructor(value, store, cliArgs) {
        [this.cmd, ...this.args] = value;
        this.store = store;
        this.cliArgs = cliArgs;
    }
    handle() {
        switch (this.cmd.toLowerCase()) {
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
            case "replconf":
                return this.handleReplconf();
            case "capa":
                return this.handleCapa();
            case "psync":
                return this.handlePsync();
            default:
                throw new Error("Command not found");
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
        let replicaof = this.cliArgs.replicaof;
        if (replicaof) {
            return Encoder.bulkString("role:slave", `master_replid:${HARDCODED_REPL_ID}`, "master_repl_offset:0");
        }
        return Encoder.bulkString("role:master", `master_replid:${HARDCODED_REPL_ID}`, "master_repl_offset:0");
    }
    handleReplconf() {
        return Encoder.simpleString("OK");
    }
    handleCapa() {
        return Encoder.simpleString("OK");
    }
    handlePsync() {
        let cmd = Encoder.simpleString("FULLRESYNC", HARDCODED_REPL_ID, "0");
        let file = Buffer.from(EMPTY_RDB_FILE_HEX, "hex");
        let header = `$${file.length}\r\n`;
        return Buffer.concat([cmd, header, file].map(Buffer.from));
    }
}
