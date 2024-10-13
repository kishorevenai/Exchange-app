import { RedisClientType, createClient } from "redis";
import { MessageToEngine } from "./types/types";

export class RedisManager {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private static instance: RedisManager;

  private constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });
    this.client.connect();
    this.publisher = createClient({
      url: "redis://localhost:6379",
    });
    this.publisher.connect();

    this.client.on("connect", () => {
      console.log("Connected to redis");
    });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  public sendAndAwait(message: MessageToEngine) {
    //message:{type:"DEPTH",data:{market:"SQL_USDC"}}A

    return new Promise((resolve) => {
      const id = this.getRandomClientId();

      this.client.subscribe(id, (message) => {
        this.client.unsubscribe(id);
        resolve(JSON.parse(message));
      });

      this.publisher.lPush(
        "messages",
        JSON.stringify({ clientId: id, message })
      );
    });
  }

  public getRandomClientId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
