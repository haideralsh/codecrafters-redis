import { RespType, RespValue } from "./resp.js";
export class Encoder {
    static encode(value, as = RespType.SimpleString) {
        return `${as}${value}${RespValue.Crlf}`;
    }
}
