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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = "http://localhost:3600";
const TOTAL_BIDS = 15;
const TOTAL_ASK = 15;
const MARKET = "TATA_INR";
const USER_ID = "1";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const price = 1000 + Math.random() * 10;
        const openOrders = yield axios_1.default.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`);
        const totalBids = openOrders.data.payload.filter((o) => o.side === "buy").length;
        const totalAsks = openOrders.data.payload.filter((o) => o.side === "sell").length;
        const cancelledBids = yield cancelBidsMoreThan(openOrders.data.payload, price);
        const cancelledAsks = yield cancelAsksLessThan(openOrders.data.payload, price);
        let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
        let asksToAdd = TOTAL_ASK - totalAsks - cancelledAsks;
        while (bidsToAdd > 0 || asksToAdd > 0) {
            if (bidsToAdd > 0) {
                yield axios_1.default.post(`${BASE_URL}/api/v1/order`, {
                    market: MARKET,
                    price: (price - Math.random() * 1).toFixed(1).toString(),
                    quantity: "1",
                    side: "buy",
                    userId: USER_ID,
                });
                bidsToAdd--;
            }
            if (asksToAdd > 0) {
                yield axios_1.default.post(`${BASE_URL}/api/v1/order`, {
                    market: MARKET,
                    price: (price + Math.random() * 1).toFixed(1).toString(),
                    quantity: "1",
                    side: "sell",
                    userId: USER_ID,
                });
                asksToAdd--;
            }
        }
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        main();
    });
}
function cancelBidsMoreThan(openOrders, price) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = [];
        openOrders.map((o) => {
            if (o.side === "buy" && (o.price > price || Math.random() < 0.1)) {
                promises.push(axios_1.default.delete(`${BASE_URL}/api/v1/order`, {
                    data: {
                        orderId: o.orderId,
                        market: MARKET,
                    },
                }));
            }
        });
        yield Promise.all(promises);
        return promises.length;
    });
}
function cancelAsksLessThan(openOrders, price) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = [];
        openOrders.map((o) => {
            if (o.side === "sell" && (o.price < price || Math.random() < 0.5)) {
                promises.push(axios_1.default.delete(`${BASE_URL}/api/v1/order`, {
                    data: {
                        orderId: o.orderId,
                        market: MARKET,
                    },
                }));
            }
        });
        yield Promise.all(promises);
        return promises.length;
    });
}
main();
