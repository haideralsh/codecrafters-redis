import * as net from "node:net";
import { CommandHandler } from "./CommandHandler.js";
import { Store } from "./store.js";
import { Parser } from "./parser.js";
import { CliArgs } from "./cliArgs.js";
import { Replica } from "./replica.js";
let store = new Store();
let cliArgs = new CliArgs();
if (cliArgs.replicaof) {
    new Replica(cliArgs).init();
}
const server = net.createServer((connection) => {
    connection.on("data", (buffer) => {
        let input = buffer.toString();
        let parser = new Parser(input);
        let value = parser.parse();
        let handler = new CommandHandler(value, store, cliArgs);
        let response = handler.handle();
        connection.write(response);
    });
});
server.listen(cliArgs.port, "127.0.0.1");
