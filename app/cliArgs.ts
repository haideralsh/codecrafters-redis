import { parseArgs } from "util";

export type Replicaof = [string, number] | undefined;

export interface Args {
  port: number;
  replicaof: Replicaof;
}

export class CliArgs {
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
    this.parsedArgs = parseArgs(CliArgs.config);
  }

  get all(): Args {
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

  get replicaof(): Args["replicaof"] {
    let masterHost = this.parsedArgs.values.replicaof;

    if (!masterHost) return;

    let [masterPort] = this.parsedArgs.positionals;
    return [masterHost, parseInt(masterPort)];
  }
}
