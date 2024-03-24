export var Resp;
(function (Resp) {
    Resp["Array"] = "*";
    Resp["SimpleString"] = "+";
    Resp["BulkString"] = "$";
    Resp["CRLF"] = "\r\n";
    Resp["NewLine"] = "\r";
})(Resp || (Resp = {}));
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
                case Resp.Array:
                    return this.scanArray();
                case Resp.SimpleString:
                    return this.scanSimpleString();
                case Resp.BulkString:
                    return this.scanBulkString();
                default:
                    this.postion++;
            }
        }
    }
    scanSimpleString() {
        let start = ++this.postion;
        while (this.input[this.postion] !== Resp.NewLine) {
            this.postion++;
        }
        let value = this.input.slice(start, this.postion);
        this.postion += 2;
        return { type: Resp.SimpleString, value };
    }
    scanBulkString() {
        let length = parseInt(this.scanSimpleString().value);
        let value = this.input.slice(this.postion, this.postion + length);
        this.postion += length + 2;
        return { type: Resp.BulkString, value };
    }
    scanArray() {
        let length = parseInt(this.scanSimpleString().value);
        let value = [];
        for (let i = 0; i < length; i++) {
            value.push(this.next());
        }
        return { type: Resp.Array, value };
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
            case Resp.BulkString:
            case Resp.SimpleString:
                return token.value;
            case Resp.Array:
                return token.value.map((t) => this.parseToken(t));
        }
    }
}
