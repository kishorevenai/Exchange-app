import { Router } from "express";
export const depthRouter = Router();
import { RedisManager } from "../RedisManager";
import { GET_DEPTH } from "../types";

depthRouter.get("/", async (req, res) => {
  const { symbol } = req.query;
  try {
    const response: any = await RedisManager.getInstance().sendAndAwait({
      type: GET_DEPTH,
      data: {
        market: symbol as string,
      },
    });
    return res.json(response).status(200);
  } catch (error) {
    return res.json(error).status(400);
  }
});
