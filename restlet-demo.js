/**
 * @NAPIVersion 2.0
 * @NScriptType Restlet
 */

/*
This file was generated via the
headintheclouds [typings-suitescript-2.0[(https://github.com/headintheclouddev/typings-suitescript-2.0) project.

It can be deployed as a restlet and will return a successful response to any GET request.
 */

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["N/log"], function (log_1) {
    var exports = {};
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get = void 0;
    log_1 = __importDefault(log_1);
    var get = function (requestParams) {
        log_1.default.debug({
            title: 'GET Request',
            details: requestParams,
        });
        return {
            success: true,
        };
    };
    exports.get = get;
    return exports;
});
