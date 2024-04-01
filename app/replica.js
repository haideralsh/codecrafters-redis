import { createConnection } from "net";
import { Encoder } from "./encoder.js";
import { Parser } from "./parser.js";
export class Replica {
    state;
    client;
    replicaof;
    port;
    constructor(replicaof, port) {
        this.state = "initial";
        this.replicaof = replicaof;
        this.port = port;
    }
    init() {
        this.connectToMaster();
    }
    connectToMaster() {
        const [masterHost, masterPort] = this.replicaof;
        const client = createConnection(masterPort, masterHost, () => {
            this.client = client;
            this.client.write(Encoder.array("ping"));
            this.state = "sent-ping";
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
    handlePong() {
        this.client.write(Encoder.array("replconf", "listening-port", String(this.port)));
        this.state = "sent-port";
    }
    handleCapabilities() {
        this.client.write(Encoder.array("replconf", "capa", "psync2"));
        this.state = "sent-cababilities";
    }
    handlePsync() {
        this.client.write(Encoder.array("psync", "?", "-1"));
        this.state = "sent-psync";
    }
}
