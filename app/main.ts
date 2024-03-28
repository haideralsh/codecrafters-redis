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

  let counter = 0;
  const client = net.createConnection(masterPort, masterHost, () => {
    client.write(Encoder.array("ping"));

    client.on("data", (buffer) => {
      let input = buffer.toString();

      let parser = new Parser(input);
      let [value] = parser.parse();
      value == value.toLowerCase();

      if (value === "PONG" && counter === 0) {
        console.log("in the pong");
        client.write(
          Encoder.array("replconf", "listening-port", String(cli.port))
        );
        counter++;
      }

      if (value === "OK" && counter === 1) {
        console.log("in the pong");
        client.write(Encoder.array("replconf", "capa", "psync2"));
        counter++;
      }

      if (value === "OK" && counter === 2) {
        client.write(Encoder.array("psync", "?", "-1"));
        counter++;
      }
    });
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
