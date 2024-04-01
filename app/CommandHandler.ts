import { CliArgs } from "./cliArgs.js";
import { Encoder } from "./encoder.js";
import { EMPTY_RDB_FILE_HEX } from "./rdb.js";
import { Store } from "./store.js";

const HARDCODED_REPL_ID = "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";

export class CommandHandler {
  private cmd: string;
  private args: string[];
  private store: Store;
  private cliArgs: CliArgs;

  constructor(value: string[], store: Store, cliArgs: CliArgs) {
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

  private handleEcho() {
    return Encoder.simpleString(this.args.join(" "));
  }

  private handlePing() {
    return Encoder.simpleString("PONG");
  }

  private handleGet() {
    let [key] = this.args;
    let value = this.store.get(key);
    if (value) return Encoder.simpleString(value);

    return Encoder.nil();
  }

  private handleSet() {
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

  private handleInfo() {
    let replicaof = this.cliArgs.replicaof;

    if (replicaof) {
      return Encoder.bulkString(
        "role:slave",
        `master_replid:${HARDCODED_REPL_ID}`,
        "master_repl_offset:0"
      );
    }

    return Encoder.bulkString(
      "role:master",
      `master_replid:${HARDCODED_REPL_ID}`,
      "master_repl_offset:0"
    );
  }

  private handleReplconf() {
    return Encoder.simpleString("OK");
  }

  private handleCapa() {
    return Encoder.simpleString("OK");
  }

  private handlePsync() {
    let cmd = Encoder.simpleString("FULLRESYNC", HARDCODED_REPL_ID, "0");
    let file = Buffer.from(EMPTY_RDB_FILE_HEX, "hex");
    let header = `$${file.length}\r\n`;

    return Buffer.concat([cmd, header, file].map(Buffer.from));
  }
}
