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
