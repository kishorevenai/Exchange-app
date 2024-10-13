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
exports.orderRouter = void 0;
const express_1 = require("express");
const RedisManager_1 = require("../RedisManager");
const types_1 = require("../types");
exports.orderRouter = (0, express_1.Router)();
exports.orderRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { market, price, quantity, side, userId } = req.body;
    try {
        const response = yield RedisManager_1.RedisManager.getInstance().sendAndAwait({
            type: types_1.CREATE_ORDER,
            data: {
                market,
                price,
                quantity,
                side,
                userId,
            },
        });
        return res.json(response === null || response === void 0 ? void 0 : response.payload).status(200);
    }
    catch (error) {
        return res.json(error).status(200);
    }
}));
exports.orderRouter.delete("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, market } = req.body;
    const response = yield RedisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.CANCEL_ORDER,
        data: {
            orderId,
            market,
        },
    });
    return res.json(response).status(200);
}));
exports.orderRouter.get("/open", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET THE ORDERS PLEASE", req.query);
    const response = yield RedisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId,
            market: req.query.market,
        },
    });
    console.log("GET ORDERS FROM NODE", response);
    return res.json(response).status(200);
}));
