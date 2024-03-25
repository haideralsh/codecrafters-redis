import { RespType, RespValue } from "./resp.js";
export class Encoder {
    static bulkString(...values) {
        let length = values.join("").length;
        let output = values.join(RespValue.Crlf);
        return `${RespType.BulkString}${length}${RespValue.Crlf}${output}${RespValue.Crlf}`;
    }
    static simpleString(value) {
        return `${RespType.SimpleString}${value}${RespValue.Crlf}`;
    }
    static nil() {
        return `${RespType.BulkString}${RespValue.Nil}${RespValue.Crlf}`;
    }
}
