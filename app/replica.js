import { createConnection } from "net";
import { Encoder } from "./encoder.js";
import { Parser } from "./parser.js";
export class Replica {
    state;
    client;
    cli;
    constructor(cli) {
        this.state = "initial";
        this.cli = cli;
    }
    init() {
        this.connectToMaster();
    }
    connectToMaster() {
        const [masterHost, masterPort] = this.cli.replicaof;
        const client = createConnection(masterPort, masterHost, () => {
            this.client = client;
            this.client.write(Encoder.array("ping"));
            this.state = "pinged";
            client.on("data", (buffer) => this.handleMasterResponse(buffer));
        });
    }
    handleMasterResponse(buffer) {
        let input = buffer.toString();
        let parser = new Parser(input);
        let [value] = parser.parse();
        switch (value.toLowerCase()) {
            case "pong":
                this.client.write(Encoder.array("replconf", "listening-port", String(this.cli.port)));
                this.state = "ponged";
                break;
            case "ok":
                if (this.state === "ponged") {
                    this.client.write(Encoder.array("replconf", "capa", "psync2"));
                    this.state = "capaed";
                    break;
                }
                if (this.state === "capaed") {
                    this.client.write(Encoder.array("psync", "?", "-1"));
                    this.state = "psynced";
                    break;
                }
        }
    }
}
