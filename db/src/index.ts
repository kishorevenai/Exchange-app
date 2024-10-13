import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "../types/types";

const pgClient = new Client({
  user: "trade",
  host: "localhost",
  database: "trade",
  password: "trade",
  port: 5433,
});

pgClient.connect();

async function main() {
  const redisClient = createClient({
    url: "redis://localhost:6379",
  });

  await redisClient.connect();

  // while (true) {
  //   const response = await redisClient.rPop("db_processor" as string);

  //   if (!response) {
  //   } else {
  //     const data: DbMessage = JSON.parse(response);
  //     if (data.type == "TRADE_ADDED") {
  //       console.log("adding data");
  //       console.log(data);
  //       const price = data.data.price;
  //       const timestamp = new Date(data.data.timestamp);
  //       const query = "INSERT INTO tata_prices (time,price) VALUES ($1,$2)";
  //       const values = [timestamp, price];
  //       await pgClient.query(query, values);
  //     }
  //   }
  // }

  setInterval(async () => {
    const response = await redisClient.rPop("db_processor" as string);

    if (!response) {
    } else {
      const data: DbMessage = JSON.parse(response);
      if (data.type == "TRADE_ADDED") {
        const price = data.data.price;
        const timestamp = new Date(data.data.timestamp);
        const query = "INSERT INTO tata_prices (time,price) VALUES ($1,$2)";
        const values = [timestamp, price];
        await pgClient.query(query, values);

        const Updatequery =
          "SELECT time_bucket('1 minute', time) AS bucket ,first(price, time) AS open,max(price) AS high,min(price) AS low,last(price, time) AS close,sum(volume) AS volume,currency_code FROM tata_prices GROUP BY bucket, currency_code LIMIT 2;";
        const result = await pgClient.query(Updatequery);

        const returnResult = {
          data: {
            e: "ticker",
            firstPrice: result.rows[1].open,
            h: result.rows[1].high,
            l: result.rows[1].low,
            c: result.rows[1].close,
            priceChange:
              Number(result.rows[1].close) - Number(result.rows[0].close),
            priceChangePercent: Math.floor(
              (Number(result.rows[1].close) * 100) /
                Number(result.rows[0].close)
            ),
            V: "500",
            s: "TATA_INR",
            trades: "500",
            v: result.rows[1].volume,
          },
        };

        redisClient.publish(
          `ticker.${data.data.market as string}`,
          JSON.stringify(returnResult)
        );
      }
      if (data.type === "ORDER_UPDATE") {
        // const query =
        //   "SELECT time_bucket('1 minute', time) AS bucket ,first(price, time) AS open,max(price) AS high,min(price) AS low,last(price, time) AS close,sum(volume) AS volume,currency_code FROM tata_prices GROUP BY bucket, currency_code LIMIT 2;";
        // const result = await pgClient.query(query);
        // console.log("=============>", result.rows);
        // const returnResult = {
        //   data: {
        //     e: "ticker",
        //     firstPrice: result.rows[1].open,
        //     h: result.rows[1].high,
        //     l: result.rows[1].low,
        //     c: result.rows[1].close,
        //     priceChange:
        //       Number(result.rows[1].close) - Number(result.rows[0].close),
        //     priceChangePercent: Math.floor(
        //       (Number(result.rows[1].close) * 100) /
        //         Number(result.rows[0].close)
        //     ),
        //     V: "500",
        //     s: "TATA_INR",
        //     trades: "500",
        //     v: result.rows[1].volume,
        //   },
        // };
        // redisClient.publish(
        //   `ticker.${data.data.market as string}`,
        //   JSON.stringify(returnResult)
        // );
      }
    }
  }, 100);
}

main();
