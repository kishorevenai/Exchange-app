import { Router, Response, Request } from "express";

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
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
});
