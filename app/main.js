import * as net from "node:net";
import { parseArgs } from "util";
import { Controller } from "./controller.js";
import { Store } from "./store.js";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
let store = new Store();
let { port } = parseOptions();
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
server.listen(port, "127.0.0.1");
export function parseOptions() {
    const parsedResult = parseArgs({
        allowPositionals: true,
        options: {
            port: {
                type: "string",
            },
            replicaof: {
                type: "string",
            },
        },
    });
    let port = parsedResult.values.port;
    let masterHost = parsedResult.values.replicaof;
    let [masterPort] = parsedResult.positionals;
    return {
        port: port ? parseInt(port) : 6379,
        replicaof: [masterHost, masterPort],
    };
}
