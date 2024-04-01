import { createConnection } from "net";
import { Encoder } from "./encoder.js";
import { Parser } from "./parser.js";
export class Replica {
    step;
    client;
    cliArgs;
    constructor(cliArgs) {
        this.step = "initial";
        this.cliArgs = cliArgs;
    }
    init() {
        this.connectToMaster();
    }
    connectToMaster() {
        const [masterHost, masterPort] = this.cliArgs.replicaof;
        const client = createConnection(masterPort, masterHost, () => {
            this.client = client;
            this.client.write(Encoder.array("ping"));
            this.step = "sent-ping";
            client.on("data", (buffer) => this.handleMasterResponse(buffer));
        });
    }
    handleMasterResponse(buffer) {
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
    handlePong() {
        this.client.write(Encoder.array("replconf", "listening-port", String(this.cliArgs.port)));
        this.step = "sent-port";
    }
    handleCapabilities() {
        this.client.write(Encoder.array("replconf", "capa", "psync2"));
        this.step = "sent-cababilities";
    }
    handlePsync() {
        this.client.write(Encoder.array("psync", "?", "-1"));
        this.step = "sent-psync";
    }
}
