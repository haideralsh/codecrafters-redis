const CRLF = "\r\n";
const NEWLINE = "\r";

enum Resp {
  Array = "*",
  SimpleString = "+",
  BulkString = "$",
}

interface Token {
  type: Resp;
  value: string | Token[];
}

export class Lexer {
  private readonly input: string;
  private postion: number;

  constructor(input: string) {
    this.input = input;
    this.postion = 0;
  }

  next(): Token {
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

  private scanSimpleString(): Token {
    let start = ++this.postion;

    while (this.input[this.postion] !== NEWLINE) {
      this.postion++;
    }

    let value = this.input.slice(start, this.postion);

    this.postion += 2;

    return { type: Resp.SimpleString, value };
  }

  private scanBulkString() {
    let length = parseInt(this.scanSimpleString().value as string);

    let value = this.input.slice(this.postion, this.postion + length);

    this.postion += length + 2;

    return { type: Resp.BulkString, value };
  }

  private scanArray() {
    let length = parseInt(this.scanSimpleString().value as string);

    let value = [];

    for (let i = 0; i < length; i++) {
      value.push(this.next());
    }

    return { type: Resp.Array, value };
  }
}

export class Parser {
  private lexer: Lexer;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
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
      case Resp.BulkString:
      case Resp.SimpleString:
        return token.value;

      case Resp.Array:
        return (token.value as Token[]).map((t) => this.parseToken(t));
    }
  }
}
