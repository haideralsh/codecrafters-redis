import { RespType, RespValue } from "./resp.js";

export class Encoder {
  static encode(value: string, as: RespType = RespType.SimpleString) {
    return `${as}${value}${RespValue.Crlf}`;
  }
}
