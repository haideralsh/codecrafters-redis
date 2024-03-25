import { parseArgs } from "util";

interface Args {
  port: number;
  replicaof: [string, string] | undefined;
}

export class Cli {
  private static config = {
    allowPositionals: true,
    options: {
      port: {
        type: "string",
      },
      replicaof: {
        type: "string",
      },
    },
  } as const;

  private parsedArgs;
  private static defaultPort = 6379;

  constructor() {
    this.parsedArgs = parseArgs(Cli.config);
  }

  get args(): Args {
    return {
      port: this.port,
      replicaof: this.replicaof,
    };
  }

  get port() {
    return this.parsedArgs.values.port
      ? parseInt(this.parsedArgs.values.port)
      : Cli.defaultPort;
  }

  get replicaof() {
    let masterHost = this.parsedArgs.values.replicaof;
    let replicaof: Args["replicaof"];

    if (masterHost) {
      let [masterPort] = this.parsedArgs.positionals;
      replicaof = [masterHost, masterPort];
    }

    return replicaof;
  }
}
