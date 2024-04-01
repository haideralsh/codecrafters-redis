import { Socket, createConnection } from "net";
import { CliArgs } from "./cliArgs.js";
import { Encoder } from "./encoder.js";
import { Parser } from "./parser.js";

type Step =
  | "initial"
  | "sent-ping"
  | "sent-port"
  | "sent-cababilities"
  | "sent-psync";

export class Replica {
  private step: Step;
  private cliArgs: CliArgs;
  private client: Socket;

  constructor(cliArgs: CliArgs) {
    this.step = "initial";
    this.cliArgs = cliArgs;
  }

  init() {
    this.connectToMaster();
  }

  private connectToMaster() {
    const [masterHost, masterPort] = this.cliArgs.replicaof;

    const client = createConnection(masterPort, masterHost, () => {
      this.client = client;

      this.client.write(Encoder.array("ping"));
      this.step = "sent-ping";

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
        if (this.step === "sent-port") {
          this.handleCapabilities();
          break;
        }

        if (this.step === "sent-cababilities") {
          this.handlePsync();
          break;
        }
    }
  }

  private handlePong() {
    this.client.write(
      Encoder.array("replconf", "listening-port", String(this.cliArgs.port))
    );
    this.step = "sent-port";
  }

  private handleCapabilities() {
    this.client.write(Encoder.array("replconf", "capa", "psync2"));
    this.step = "sent-cababilities";
  }

  private handlePsync() {
    this.client.write(Encoder.array("psync", "?", "-1"));
    this.step = "sent-psync";
  }
}
