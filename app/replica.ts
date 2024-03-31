import { Socket, createConnection } from "net";
import { Cli } from "./cli.js";
import { Encoder } from "./encoder.js";
import { Parser } from "./parser.js";

type State =
  | "initial"
  | "sent-ping"
  | "sent-port"
  | "sent-cababilities"
  | "sent-psync";

export class Replica {
  private state: State;
  private client: Socket;
  private cli: Cli;

  constructor(cli: Cli) {
    this.state = "initial";
    this.cli = cli;
  }

  init() {
    this.connectToMaster();
  }

  private connectToMaster() {
    const [masterHost, masterPort] = this.cli.replicaof;

    const client = createConnection(masterPort, masterHost, () => {
      this.client = client;

      this.client.write(Encoder.array("ping"));
      this.state = "sent-ping";

      client.on("data", (buffer) => this.handleMasterResponse(buffer));
    });
  }

  private handleMasterResponse(buffer: Buffer) {
    let input = buffer.toString();

    let parser = new Parser(input);
    let [value] = parser.parse();

    switch (value.toLowerCase()) {
      case "pong":
        this.handlePong();
        break;

      case "ok":
        if (this.state === "sent-port") {
          this.handleCapabilities();
          break;
        }

        if (this.state === "sent-cababilities") {
          this.handlePsync();
          break;
        }
    }
  }

  private handlePong() {
    this.client.write(
      Encoder.array("replconf", "listening-port", String(this.cli.port))
    );
    this.state = "sent-port";
  }

  private handleCapabilities() {
    this.client.write(Encoder.array("replconf", "capa", "psync2"));
    this.state = "sent-cababilities";
  }

  private handlePsync() {
    this.client.write(Encoder.array("psync", "?", "-1"));
    this.state = "sent-psync";
  }
}
