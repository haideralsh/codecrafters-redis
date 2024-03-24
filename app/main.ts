import * as net from "node:net";
import { Lexer, Parser } from "./resp.js";

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    let input = buffer.toString();

    let lexer = new Lexer(input);
    let parser = new Parser(lexer);

    let [cmd, ...args] = parser.parse();

    console.log({ cmd, args });

    if (cmd === "ping") {
      return connection.write("+PONG\r\n");
    } else if (cmd === "echo") {
      return connection.write("+" + args.join(" ") + "\r\n");
    }

    connection.write("+OK\r\n");
  });
});

server.listen(6379, "127.0.0.1");
