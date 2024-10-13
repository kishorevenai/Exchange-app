import express from "express";
import cors from "cors";
const PORT = 3600;
import { tickersRouter } from "./routes/tickers";
import { depthRouter } from "./routes/depth";
import { klineRouter } from "./routes/kline";
import { orderRouter } from "./routes/order";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/tickers", tickersRouter);
// app.use("/api/v1/trades")
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/kline", klineRouter);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
