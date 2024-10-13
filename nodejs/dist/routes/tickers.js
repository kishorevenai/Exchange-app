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
exports.tickersRouter = void 0;
const express_1 = require("express");
exports.tickersRouter = (0, express_1.Router)();
exports.tickersRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dummyData = [
        {
            firstPrice: "30",
            high: "50",
            lastPrice: "90",
            low: "10",
            priceChange: "5",
            priceChangePercent: "50",
            quoteVolume: "300",
            symbol: "SOL_USQC",
            trades: "150",
            volume: "500",
        },
        {
            firstPrice: "30",
            high: "50",
            lastPrice: "40",
            low: "10",
            priceChange: "5",
            priceChangePercent: "50",
            quoteVolume: "300",
            symbol: "TATA_INR",
            trades: "150",
            volume: "500",
        },
    ];
    return res.json(dummyData).status(200);
}));
