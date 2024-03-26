import { Lexer, Token } from "./lexer.js";
import { RespType } from "./resp.js";

export class Parser {
  private lexer: Lexer;

  constructor(input: string) {
    this.lexer = new Lexer(input);
  }

  parse() {
    let result = [];
    let token: Token;

    while ((token = this.lexer.next())) {
      let value = this.parseToken(token);
      result.push(value);
    }

    return result.flat();
  }

  private parseToken(token: Token) {
    switch (token.type) {
      case RespType.BulkString:
      case RespType.SimpleString:
        return token.value;

      case RespType.Array:
        return (token.value as Token[]).map((t) => this.parseToken(t));
    }
  }
}
