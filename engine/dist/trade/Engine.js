"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.BASE_CURRENCY = void 0;
const Orderbook_1 = require("./Orderbook");
const fromApi_1 = require("../types/fromApi");
const RedisManager_1 = require("../RedisManager");
const toApi_1 = require("../types/toApi");
const types_1 = require("../types");
const fs_1 = __importDefault(require("fs"));
exports.BASE_CURRENCY = "INR";
class Engine {
    constructor() {
        this.orderbooks = [];
        this.balances = new Map();
        let snapshot = null;
        try {
            if (true) {
                snapshot = fs_1.default.readFileSync("./snapshot.json");
            }
        }
        catch (error) {
            console.log(error);
        }
        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderbooks = snapshotSnapshot.orderbooks.map((o) => new Orderbook_1.Orderbook(o.baseAsset, o.bids, o.asks, o.currentPrice, o.lastTradeId));
            this.balances = new Map(snapshotSnapshot.balances);
        }
        else {
            console.log("work on progress");
        }
        setInterval(() => {
            // this.saveSnapshot();
        }, 1000 * 3);
    }
    saveSnapshot() {
        const snapShotSnapshot = {
            orderbooks: this.orderbooks.map((o) => o.getSnapshot()),
            balances: Array.from(this.balances.entries()),
        };
        fs_1.default.writeFileSync("./snapshot.json", JSON.stringify(snapShotSnapshot));
    }
    process({ message, clientId, }) {
        switch (message.type) {
            case toApi_1.CREATE_ORDER:
                try {
                    const { executedQty, fills, orderId } = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills,
                        },
                    });
                }
                catch (error) {
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0,
                        },
                    });
                }
                break;
            case fromApi_1.GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
                    if (!orderbook) {
                        throw new Error("No Orderbook found");
                    }
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: orderbook.getDepth(),
                    });
                }
                catch (error) {
                    console.log(error);
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: {
                            bids: [],
                            asks: [],
                        },
                    });
                }
                break;
            case toApi_1.CANCEL_ORDER:
                try {
                    //@ts-ignore
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market;
                    const cancelOrderbook = this.orderbooks.find((o) => o.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if (!cancelOrderbook) {
                        throw new Error("No orderbook found");
                    }
                    const order = cancelOrderbook.asks.find((o) => o.orderId === orderId) ||
                        cancelOrderbook.bids.find((o) => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new Error("No order found");
                    }
                    if (order.side === "buy") {
                        const price = cancelOrderbook.cancelBid(order);
                        const leftQuantity = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].available +=
                            leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].locked -=
                            leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    else {
                        const price = cancelOrderbook.cancelAsk(order);
                        const leftQuantity = order.quantity - order.filled;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available +=
                            leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0,
                        },
                    });
                }
                catch (e) {
                    console.log("Error hwile cancelling order");
                    console.log(e);
                }
                break;
            case fromApi_1.GET_OPEN_ORDERS:
                try {
                    const openOrderbook = this.orderbooks.find((o) => o.ticker() === message.data.market);
                    if (!openOrderbook)
                        throw new Error("No orderbook found");
                    const openOrders = openOrderbook.getOpenOrders(message.data.userId);
                    console.log("OPEN ORDERS", openOrders);
                    RedisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders,
                    });
                }
                catch (error) {
                    console.log(error);
                }
                break;
            case fromApi_1.ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;
        }
    }
    onRamp(userId, amount) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [exports.BASE_CURRENCY]: {
                    available: amount,
                    locked: 0,
                },
            });
        }
        else {
            userBalance[exports.BASE_CURRENCY].available += amount;
        }
    }
    sendUpdatedDepthAt(price, market) {
        const orderbook = this.orderbooks.find((o) => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth === null || depth === void 0 ? void 0 : depth.bids.filter((x) => x[0] === price);
        const updatedAsks = depth === null || depth === void 0 ? void 0 : depth.asks.filter((x) => x[0] === price);
        RedisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth",
            },
        });
    }
    createOrder(market, price, quantity, side, userId) {
        const orderbook = this.orderbooks.find((o) => o.ticker() === market);
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[0];
        if (!orderbook) {
            throw new Error("No orderbook found");
        }
        this.checkAndLockFund(baseAsset, quoteAsset, side, userId, price, quantity);
        const order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId,
        };
        const { fills, executedQty } = orderbook.addOrder(order);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);
        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        this.publishWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);
        return { executedQty, fills, orderId: order.orderId };
    }
    publishWsDepthUpdates(fills, price, side, market) {
        const orderbook = this.orderbooks.find((o) => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        if (side === "buy") {
            const updatedAsks = depth.asks.filter((x) => fills.map((f) => f.price).includes(x[0].toString()));
            const updatedBids = depth === null || depth === void 0 ? void 0 : depth.bids.find((x) => x[0] === price);
            console.log("publish ws depth updates");
            RedisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBids ? [updatedBids] : [],
                    e: "depth",
                },
            });
        }
        if (side === "sell") {
            const updatedBids = depth === null || depth === void 0 ? void 0 : depth.bids.filter((x) => fills.map((f) => f.price).includes(x[0].toString()));
            const updatedAsk = depth === null || depth === void 0 ? void 0 : depth.asks.find((x) => x[0] === price);
            console.log("publish ws depth updated");
            RedisManager_1.RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [],
                    b: updatedBids,
                    e: "depth",
                },
            });
        }
    }
    publishWsTrades(fills, userId, market) {
        fills.forEach((fill) => {
            RedisManager_1.RedisManager.getInstance().publishMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId,
                    p: fill.price,
                    q: fill.qty.toString(),
                    s: market,
                },
            });
        });
    }
    updateDbOrders(order, executedQty, fills, market) {
        RedisManager_1.RedisManager.getInstance().pushMessage({
            type: types_1.ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            },
        });
        // fills.forEach((fill) => {
        //   RedisManager.getInstance().pushMessage({
        //     type: ORDER_UPDATE,
        //     data: {
        //       orderId: fill.marketOrderId,
        //       executedQty: fill.qty,
        //     },
        //   });
        // });
    }
    createDbTrades(fills, market, userId) {
        fills.forEach((fill) => {
            RedisManager_1.RedisManager.getInstance().pushMessage({
                type: types_1.TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId,
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now(),
                },
            });
        });
    }
    updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty) {
        if (side === "buy") {
            fills.forEach((fill) => {
                var _a, _b, _c, _d;
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available =
                    //@ts-ignore
                    ((_a = this.balances.get(fill.otherUserId)) === null || _a === void 0 ? void 0 : _a[quoteAsset].available) +
                        //@ts-ignore
                        fill.qty * fill.price;
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked =
                    //@ts-ignore
                    ((_b = this.balances.get(userId)) === null || _b === void 0 ? void 0 : _b[quoteAsset].locked) -
                        //@ts-ignore
                        fill.qty * fill.price;
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked =
                    //@ts-ignore
                    ((_c = this.balances.get(fill.otherUserId)) === null || _c === void 0 ? void 0 : _c[baseAsset].locked) - fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available =
                    //@ts-ignore
                    ((_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[baseAsset].available) + fill.qty;
            });
        }
        else {
            fills.forEach((fill) => {
                var _a, _b, _c;
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked =
                    //@ts-ignore
                    ((_a = this.balances.get(fill.otherUserId)) === null || _a === void 0 ? void 0 : _a[quoteAsset].locked) -
                        //@ts-ignore
                        fill.qty * fill.price;
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available =
                    //@ts-ignore
                    ((_b = this.balances.get(userId)) === null || _b === void 0 ? void 0 : _b[quoteAsset].available) +
                        //@ts-ignore
                        fill.qty * fill.price;
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available =
                    //@ts-ignore
                    ((_c = this.balances.get(fill.otherUserId)) === null || _c === void 0 ? void 0 : _c[baseAsset].available) + fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked =
                    //@ts-ignore
                    this.balances.get(userId)[baseAsset].locked - fill.qty;
            });
        }
    }
    checkAndLockFund(baseAsset, quoteAsset, side, userId, price, quantity) {
        var _a, _b, _c, _d, _e;
        if (side === "buy") {
            if ((((_b = (_a = this.balances.get(userId)) === null || _a === void 0 ? void 0 : _a[quoteAsset]) === null || _b === void 0 ? void 0 : _b.available) || 0) <
                Number(quantity) * Number(price)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].available =
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available -
                    Number(quantity) * Number(price);
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].locked =
                //@ts-ignore
                ((_c = this.balances.get(userId)) === null || _c === void 0 ? void 0 : _c[quoteAsset].locked) +
                    Number(quantity) * Number(price);
        }
        else {
            if ((((_e = (_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[baseAsset]) === null || _e === void 0 ? void 0 : _e.available) || 0) <
                Number(quantity)) {
                throw new Error("Insufficient shares");
            }
            //@ts-ignore
            this.balances.get(userId)[baseAsset].available =
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available - Number(quantity);
            //@ts-ignore
            this.balances.get(userId)[baseAsset].locked =
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked + Number(quantity);
        }
    }
}
exports.Engine = Engine;
// RedisManager.getInstance().sendToApi(clientId, {
//   type: "DEPTH",
//   payload: {
//     bids: [
//       ["0.0085", "2237.05"],
//       ["0.0086", "2300.00"],
//       ["0.0119", "71983.64"],
//       ["0.0200", "200.00"],
//       ["0.0242", "1546.00"],
//       ["0.0260", "1438.95"],
//       ["0.0261", "8253.91"],
//       ["0.0300", "3326.43"],
//       ["0.0301", "708.35"],
//       ["0.0359", "10091.05"],
//       ["0.0370", "10000.00"],
//       ["0.0448", "111475.61"],
//       ["0.0479", "31305.29"],
//       ["0.0483", "6206.50"],
//       ["0.0485", "11339.14"],
//     ],
//     asks: [
//       ["0.0493", "2030.57"],
//       ["0.0496", "5040.32"],
//       ["0.0497", "6042.05"],
//       ["0.0498", "6031.53"],
//       ["0.0502", "29925.10"],
//       ["0.0534", "93677.14"],
//       ["0.0550", "252.62"],
//       ["0.0600", "692.94"],
//       ["0.0613", "5662.21"],
//       ["0.0639", "750.94"],
//       ["0.0650", "1568.00"],
//       ["0.0700", "504.42"],
//       ["0.0750", "1004.64"],
//       ["0.0763", "100.00"],
//       ["0.0815", "912.35"],
//       ["0.0850", "1500.00"],
//       ["0.0899", "195.90"],
//       ["0.0900", "2595.48"],
//       ["0.0989", "18658.00"],
//       ["0.0990", "4702.00"],
//       ["0.1000", "1865.10"],
//       ["0.1100", "1707.35"],
//       ["0.1170", "5533.76"],
//       ["0.1200", "440.12"],
//       ["0.1250", "312.44"],
//       ["0.1499", "1454.00"],
//       ["0.1500", "4609.11"],
//       ["0.1510", "209.93"],
//       ["0.1700", "722.00"],
//       ["0.1800", "4000.00"],
//       ["0.1900", "236.50"],
//       ["0.1910", "282.75"],
//       ["0.2000", "1243.22"],
//       ["0.2071", "2056.21"],
//       ["0.2100", "8.42"],
//       ["0.2141", "761.36"],
//       ["0.2174", "90.00"],
//       ["0.2190", "33.12"],
//       ["0.2200", "433.00"],
//       ["0.2500", "311.77"],
//       ["0.2559", "100.48"],
//       ["0.2680", "56.03"],
//       ["0.2800", "260.00"],
//       ["0.2949", "144.07"],
//       ["0.2999", "5.00"],
//       ["0.3000", "3272.00"],
//       ["0.3300", "1486.40"],
//       ["0.3413", "9.94"],
//       ["0.3900", "93.00"],
//       ["0.3999", "5.00"],
//       ["0.4391", "50.00"],
//       ["0.4400", "56.00"],
//       ["0.4999", "5.00"],
//       ["0.5000", "442.72"],
//       ["0.8000", "375.66"],
//       ["0.9999", "5.00"],
//       ["1.0537", "20.00"],
//       ["1.2537", "20.00"],
//       ["2.8100", "913.43"],
//       ["4.1439", "50.00"],
//       ["4.9999", "5.00"],
//       ["9.0000", "20.00"],
//       ["9.9999", "4.00"],
//       ["98.0000", "20.00"],
//       ["115.0000", "19.91"],
//       ["121.6700", "754.33"],
//     ],
//   },
// });
