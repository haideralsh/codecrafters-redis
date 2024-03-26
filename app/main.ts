import * as net from "node:net";
import { Controller } from "./controller.js";
import { Store } from "./store.js";
import { Parser } from "./parser.js";
import { Cli } from "./cli.js";
import { Encoder } from "./encoder.js";

let store = new Store();
let cli = new Cli();

if (cli.replicaof) {
  const [masterHost, masterPort] = cli.replicaof;

  const client = net.createConnection(masterPort, masterHost, () => {
    client.write(Encoder.array("ping"));
  });
}

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    let input = buffer.toString();

    let parser = new Parser(input);
    let value = parser.parse();

    let controller = new Controller(value, store, cli);
    let response = controller.handle();

    connection.write(response);
  });
});

server.listen(cli.port, "127.0.0.1");
