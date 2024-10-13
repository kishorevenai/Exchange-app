"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const redis_1 = require("redis");
const pgClient = new pg_1.Client({
    user: "trade",
    host: "localhost",
    database: "trade",
    password: "trade",
    port: 5433,
});
pgClient.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisClient = (0, redis_1.createClient)({
            url: "redis://localhost:6379",
        });
        yield redisClient.connect();
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
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const response = yield redisClient.rPop("db_processor");
            if (!response) {
            }
            else {
                const data = JSON.parse(response);
                if (data.type == "TRADE_ADDED") {
                    const price = data.data.price;
                    const timestamp = new Date(data.data.timestamp);
                    const query = "INSERT INTO tata_prices (time,price) VALUES ($1,$2)";
                    const values = [timestamp, price];
                    yield pgClient.query(query, values);
                    const Updatequery = "SELECT time_bucket('1 minute', time) AS bucket ,first(price, time) AS open,max(price) AS high,min(price) AS low,last(price, time) AS close,sum(volume) AS volume,currency_code FROM tata_prices GROUP BY bucket, currency_code LIMIT 2;";
                    const result = yield pgClient.query(Updatequery);
                    const returnResult = {
                        data: {
                            e: "ticker",
                            firstPrice: result.rows[1].open,
                            h: result.rows[1].high,
                            l: result.rows[1].low,
                            c: result.rows[1].close,
                            priceChange: Number(result.rows[1].close) - Number(result.rows[0].close),
                            priceChangePercent: Math.floor((Number(result.rows[1].close) * 100) /
                                Number(result.rows[0].close)),
                            V: "500",
                            s: "TATA_INR",
                            trades: "500",
                            v: result.rows[1].volume,
                        },
                    };
                    redisClient.publish(`ticker.${data.data.market}`, JSON.stringify(returnResult));
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
        }), 100);
    });
}
main();
