import { Resp } from "./resp.js";

export class Controller {
  private cmd: string;
  private args: string[];

  constructor(value: any[]) {
    [this.cmd, ...this.args] = value;
  }

  handle() {
    switch (this.cmd) {
      case "ping":
        return Encoder.encode("PONG");

      case "echo":
        return Encoder.encode(this.args.join(" "));
    }
  }
}

class Encoder {
  static encode(value: string) {
    return `${Resp.SimpleString}${value}${Resp.CRLF}`;
  }
}
