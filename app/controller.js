import { Resp } from "./resp.js";
export class Controller {
    cmd;
    args;
    constructor(value) {
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
    static encode(value) {
        return `${Resp.SimpleString}${value}${Resp.CRLF}`;
    }
}
