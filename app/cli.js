import { parseArgs } from "util";
export class CliArgs {
    static config = {
        allowPositionals: true,
        options: {
            port: {
                type: "string",
            },
            replicaof: {
                type: "string",
            },
        },
    };
    parsedArgs;
    static defaultPort = 6379;
    constructor() {
        this.parsedArgs = parseArgs(CliArgs.config);
    }
    get all() {
        return {
            port: this.port,
            replicaof: this.replicaof,
        };
    }
    get port() {
        return this.parsedArgs.values.port
            ? parseInt(this.parsedArgs.values.port)
            : CliArgs.defaultPort;
    }
    get replicaof() {
        let masterHost = this.parsedArgs.values.replicaof;
        if (!masterHost)
            return;
        let [masterPort] = this.parsedArgs.positionals;
        return [masterHost, parseInt(masterPort)];
    }
}
