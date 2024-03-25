import { RespType } from "./resp.js";
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
