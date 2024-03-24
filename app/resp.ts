export enum RespType {
  Array = "*",
  SimpleString = "+",
  BulkString = "$",
}

export enum RespValue {
  Crlf = "\r\n",
  NewLine = "\r",
  Nil = "-1",
}

interface Token {
  type: RespType;
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

  private scanSimpleString(): Token {
    let start = ++this.postion;

    while (this.input[this.postion] !== RespValue.NewLine) {
      this.postion++;
    }

    let value = this.input.slice(start, this.postion);

    this.postion += 2;

    return { type: RespType.SimpleString, value };
  }

  private scanBulkString() {
    let length = parseInt(this.scanSimpleString().value as string);

    let value = this.input.slice(this.postion, this.postion + length);

    this.postion += length + 2;

    return { type: RespType.BulkString, value };
  }

  private scanArray() {
    let length = parseInt(this.scanSimpleString().value as string);

    let value = [];

    for (let i = 0; i < length; i++) {
      value.push(this.next());
    }

    return { type: RespType.Array, value };
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
      case RespType.BulkString:
      case RespType.SimpleString:
        return token.value;

      case RespType.Array:
        return (token.value as Token[]).map((t) => this.parseToken(t));
    }
  }
}
