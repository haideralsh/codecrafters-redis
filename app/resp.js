export var RespType;
(function (RespType) {
    RespType["Array"] = "*";
    RespType["SimpleString"] = "+";
    RespType["BulkString"] = "$";
})(RespType || (RespType = {}));
export var RespValue;
(function (RespValue) {
    RespValue["Crlf"] = "\r\n";
    RespValue["NewLine"] = "\r";
    RespValue["Nil"] = "-1";
})(RespValue || (RespValue = {}));
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
        return { type: RespType.SimpleString, value };
    }
    scanBulkString() {
        let length = parseInt(this.scanSimpleString().value);
        let value = this.input.slice(this.postion, this.postion + length);
        this.postion += length + 2;
        return { type: RespType.BulkString, value };
    }
    scanArray() {
        let length = parseInt(this.scanSimpleString().value);
        let value = [];
        for (let i = 0; i < length; i++) {
            value.push(this.next());
        }
        return { type: RespType.Array, value };
    }
}
export class Parser {
    lexer;
    constructor(lexer) {
        this.lexer = lexer;
    }
    parse() {
        let result = [];
        let token;
        while ((token = this.lexer.next())) {
            let value = this.parseToken(token);
            result.push(value);
        }
        return result.flat();
    }
    parseToken(token) {
        switch (token.type) {
            case RespType.BulkString:
            case RespType.SimpleString:
                return token.value;
            case RespType.Array:
                return token.value.map((t) => this.parseToken(t));
        }
    }
}
