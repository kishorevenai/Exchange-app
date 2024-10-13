import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_OPEN_ORDERS } from "../types";
import { RedisSearchLanguages } from "redis";

export const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
  const { market, price, quantity, side, userId } = req.body;

  try {
    const response: any = await RedisManager.getInstance().sendAndAwait({
      type: CREATE_ORDER,
      data: {
        market,
        price,
        quantity,
        side,
        userId,
      },
    });

    return res.json(response?.payload).status(200);
  } catch (error) {
    return res.json(error).status(200);
  }
});

orderRouter.delete("/", async (req, res) => {
  const { orderId, market } = req.body;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: CANCEL_ORDER,
    data: {
      orderId,
      market,
    },
  });

  return res.json(response).status(200);
});
orderRouter.get("/open", async (req, res) => {
  console.log("GET THE ORDERS PLEASE", req.query);
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_OPEN_ORDERS,
    data: {
      userId: req.query.userId as string,
      market: req.query.market as string,
    },
  });
  console.log("GET ORDERS FROM NODE", response);

  return res.json(response).status(200);
});
