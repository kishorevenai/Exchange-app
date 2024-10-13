"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const PORT = 3600;
const tickers_1 = require("./routes/tickers");
const depth_1 = require("./routes/depth");
const kline_1 = require("./routes/kline");
const order_1 = require("./routes/order");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/order", order_1.orderRouter);
app.use("/api/v1/tickers", tickers_1.tickersRouter);
// app.use("/api/v1/trades")
app.use("/api/v1/depth", depth_1.depthRouter);
app.use("/api/v1/kline", kline_1.klineRouter);
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
