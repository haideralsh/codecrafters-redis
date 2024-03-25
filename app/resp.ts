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
