"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orderbook = void 0;
const Engine_1 = require("./Engine");
class Orderbook {
    constructor(baseAssets, bids, asks, lastTradeId, currentPrice) {
        this.quoteAsset = Engine_1.BASE_CURRENCY;
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAssets;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }
    ticker() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }
    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice,
        };
    }
    getDepth() {
        const bids = [];
        const asks = [];
        const bidsObj = {};
        const asksObj = {};
        for (let i = 0; i < this.bids.length; i++) {
            const order = this.bids[i];
            if (!bidsObj[order.price]) {
                bidsObj[order.price] = 0;
            }
            bidsObj[order.price] += order.quantity - order.filled;
        }
        for (let i = 0; i < this.asks.length; i++) {
            const order = this.asks[i];
            if (!asksObj[order.price]) {
                asksObj[order.price] = 0;
            }
            asksObj[order.price] += order.quantity - order.filled;
        }
        for (const price in bidsObj) {
            bids.push([price, bidsObj[price].toString()]);
        }
        for (const price in asksObj) {
            asks.push([price, asksObj[price].toString()]);
        }
        return {
            bids,
            asks,
        };
    }
    addOrder(order) {
        if (order.side === "buy") {
            const { executedQty, fills } = this.matchBid(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills,
                };
            }
            this.bids.push(order);
            return {
                executedQty,
                fills,
            };
        }
        else {
            const { executedQty, fills } = this.matchAsk(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills,
                };
            }
            this.asks.push(order);
            return {
                executedQty,
                fills,
            };
        }
    }
    matchAsk(order) {
        const fills = [];
        let executedQty = 0;
        const sortedBids = this.bids.sort((aPrice, bPrice) => bPrice.price - aPrice.price);
        for (let i = 0; i < this.bids.length; i++) {
            if (executedQty === order.quantity)
                break;
            if (this.bids[i].price <= order.price && executedQty < order.quantity) {
                const amountRemaining = Math.min(order.quantity - executedQty, this.bids[i].quantity);
                executedQty += amountRemaining;
                this.bids[i].filled += amountRemaining;
                fills.push({
                    price: this.bids[i].price.toString(),
                    qty: amountRemaining,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.bids[i].userId,
                    marketOrderId: this.bids[i].orderId,
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].filled === this.bids[i].quantity) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty,
        };
    }
    matchBid(order) {
        const fills = [];
        let executedQty = 0;
        // const sortedAsks = this.asks.sort(
        //   (aPrice, bPrice) => aPrice.price - bPrice.price
        // );
        for (let i = 0; i < this.asks.length; i++) {
            if (executedQty === order.quantity)
                break;
            if (this.asks[i].price <= order.price && executedQty < order.quantity) {
                const filledQty = Math.min(order.quantity - executedQty, this.asks[i].quantity);
                executedQty += filledQty;
                this.asks[i].filled += filledQty;
                fills.push({
                    price: this.asks[i].price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.asks[i].userId,
                    marketOrderId: this.asks[i].orderId,
                });
            }
        }
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i].filled === this.asks[i].quantity) {
                this.asks.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty,
        };
    }
    getOpenOrders(userId) {
        const asks = this.asks.filter((x) => x.userId === userId);
        const bids = this.bids.filter((x) => x.userId === userId);
        return [...asks, ...bids];
    }
    cancelBid(order) {
        const index = this.bids.findIndex((x) => x.orderId === order.orderId);
        if (index != -1) {
            const price = this.bids[index].price;
            this.bids.splice(index, 1);
            return price;
        }
    }
    cancelAsk(order) {
        const index = this.asks.findIndex((x) => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            this.asks.splice(index, 1);
            return price;
        }
    }
}
exports.Orderbook = Orderbook;
