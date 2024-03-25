import { RespType, RespValue } from "./resp.js";
export class Encoder {
    static bulkString(value) {
        return `${RespType.BulkString}${value.length}${RespValue.Crlf}${value}${RespValue.Crlf}`;
    }
    static simpleString(value) {
        return `${RespType.SimpleString}${value}${RespValue.Crlf}`;
    }
    static nil() {
        return `${RespType.BulkString}${RespValue.Nil}${RespValue.Crlf}`;
    }
}
