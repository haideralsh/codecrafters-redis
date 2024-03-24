import * as net from "node:net";
import { Lexer, Parser } from "./resp.js";
import { Controller } from "./controller.js";
import { Store } from "./store.js";

let store = new Store();

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    let input = buffer.toString();

    let lexer = new Lexer(input);
    let parser = new Parser(lexer);
    let value = parser.parse();

    let controller = new Controller(value, store);
    let response = controller.handle();

    connection.write(response);
  });
});

server.listen(6379, "127.0.0.1");
