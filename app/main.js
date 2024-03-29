import * as net from "node:net";
import { Handler } from "./handler.js";
import { Store } from "./store.js";
import { Parser } from "./parser.js";
import { Cli } from "./cli.js";
import { Replica } from "./replica.js";
let store = new Store();
let cli = new Cli();
if (cli.replicaof) {
    new Replica(cli).init();
}
const server = net.createServer((connection) => {
    connection.on("data", (buffer) => {
        let input = buffer.toString();
        let parser = new Parser(input);
        let value = parser.parse();
        let handler = new Handler(value, store, cli);
        let response = handler.handle();
        connection.write(response);
    });
});
server.listen(cli.port, "127.0.0.1");
