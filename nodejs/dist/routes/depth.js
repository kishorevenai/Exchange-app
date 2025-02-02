"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depthRouter = void 0;
const express_1 = require("express");
exports.depthRouter = (0, express_1.Router)();
const RedisManager_1 = require("../RedisManager");
const types_1 = require("../types");
exports.depthRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol } = req.query;
    try {
        const response = yield RedisManager_1.RedisManager.getInstance().sendAndAwait({
            type: types_1.GET_DEPTH,
            data: {
                market: symbol,
            },
        });
        return res.json(response).status(200);
    }
    catch (error) {
        return res.json(error).status(400);
    }
}));
