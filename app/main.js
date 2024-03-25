import * as net from "node:net";
import { Controller } from "./controller.js";
import { Store } from "./store.js";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { Cli } from "./cli.js";
let store = new Store();
let cli = new Cli();
const server = net.createServer((connection) => {
    connection.on("data", (buffer) => {
        let input = buffer.toString();
        let lexer = new Lexer(input);
        let parser = new Parser(lexer);
        let value = parser.parse();
        let controller = new Controller(value, store, cli);
        let response = controller.handle();
        connection.write(response);
    });
});
server.listen(cli.port, "127.0.0.1");
