import { createClient } from "redis";
import { Engine } from "./trade/Engine";

async function main() {
  const engine = new Engine();
  const redisClient = createClient({
    url: "redis://localhost:6379",
  });
  await redisClient.connect();

  // while (true) {
  //   const response = await redisClient.rPop("messages" as string);

  //   if (!response) {
  //     console.log("no response");
  //   } else {
  //     engine.process(JSON.parse(response));
  //   }
  // }

  setInterval(async () => {
    const response = await redisClient.rPop("messages" as string);
    if (!response) {
      console.log("no response");
    } else {
      engine.process(JSON.parse(response));
    }
  },100);
}

main();
