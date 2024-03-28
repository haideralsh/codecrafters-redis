import { RespType, RespValue } from "./resp.js";
export class Lexer {
    input;
    postion;
    constructor(input) {
        this.input = input;
        this.postion = 0;
    }
    next() {
        while (this.postion < this.input.length) {
            let char = this.input[this.postion];
            switch (char) {
                case RespType.Array:
                    return this.scanArray();
                case RespType.SimpleString:
                    return this.scanSimpleString();
                case RespType.BulkString:
                    return this.scanBulkString();
                default:
                    this.postion++;
            }
        }
    }
    scanSimpleString() {
        let start = ++this.postion;
        while (this.input[this.postion] !== RespValue.NewLine) {
            this.postion++;
        }
        let value = this.input.slice(start, this.postion);
        this.postion += 2;
        return { type: "SimpleString", value };
    }
    scanBulkString() {
        let length = parseInt(this.scanSimpleString().value);
        let value = this.input.slice(this.postion, this.postion + length);
        this.postion += length + 2;
        return { type: "BulkString", value };
    }
    scanArray() {
        let length = parseInt(this.scanSimpleString().value);
        let value = [];
        for (let i = 0; i < length; i++) {
            value.push(this.next());
        }
        return { type: "Array", value };
    }
}
