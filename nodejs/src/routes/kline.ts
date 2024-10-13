import { time } from "console";
import { Router } from "express";
import { Client } from "pg";

export const klineRouter = Router();

const pgClient = new Client({
  user: "trade",
  host: "localhost",
  database: "trade",
  password: "trade",
  port: 5433,
});

pgClient.connect();

klineRouter.get("/", async (req, res) => {
  const { symbol, interval, startTime, endTime } = req.query;

  let query;
  switch (interval) {
    case "1m":
      query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
      break;
    case "1h":
      query = `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2`;
      break;
    case "1w":
      query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
      break;
    default:
      return res.status(400).status(400).json({ message: "Invalid interval" });
  }

  try {
    const result = await pgClient.query(query, [
      //@ts-ignore
      new Date((startTime * 1000) as any),
      //@ts-ignore
      new Date((endTime * 1000) as any),
    ]);

    console.log("CHECKING RESULT", result);

    return res.json(
      result.rows.map((x) => ({
        close: x.close,
        end: x.end,
        high: x.high,
        low: x.low,
        open: x.open,
        quoteVolume: x.quoteVolume,
        start: x.start,
        trades: x.trades,
        volume: x.volume,
        time: x.bucket,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

//   return res.json([
//     {
//       close: "0.0351",
//       end: "2024-08-19 07:00:00",
//       high: "0.0351",
//       low: "0.0351",
//       open: "0.0351",
//       quoteVolume: "93.624687",
//       start: "2024-08-19 06:00:00",
//       trades: "1",
//       volume: "2667.37",
//     },
//     {
//       close: "0.034",
//       end: "2024-08-19 08:00:00",
//       high: "0.034",
//       low: "0.034",
//       open: "0.034",
//       quoteVolume: "253.30884",
//       start: "2024-08-19 07:00:00",
//       trades: "2",
//       volume: "7450.26",
//     },
//     {
//       close: "0.0346",
//       end: "2024-08-19 09:00:00",
//       high: "0.0346",
//       low: "0.0337",
//       open: "0.0339",
//       quoteVolume: "640.779281",
//       start: "2024-08-19 08:00:00",
//       trades: "7",
//       volume: "18903.08",
//     },
//     {
//       close: "0.034",
//       end: "2024-08-19 10:00:00",
//       high: "0.034",
//       low: "0.034",
//       open: "0.034",
//       quoteVolume: "14.96",
//       start: "2024-08-19 09:00:00",
//       trades: "1",
//       volume: "440",
//     },
//     {
//       close: "0.033",
//       end: "2024-08-19 11:00:00",
//       high: "0.034",
//       low: "0.033",
//       open: "0.034",
//       quoteVolume: "370.294288",
//       start: "2024-08-19 10:00:00",
//       trades: "11",
//       volume: "11125.81",
//     },
//     {
//       close: "0.0325",
//       end: "2024-08-19 14:00:00",
//       high: "0.0326",
//       low: "0.0322",
//       open: "0.0324",
//       quoteVolume: "126.603916",
//       start: "2024-08-19 13:00:00",
//       trades: "4",
//       volume: "3904.54",
//     },
//     {
//       close: "0.032",
//       end: "2024-08-19 15:00:00",
//       high: "0.0323",
//       low: "0.032",
//       open: "0.0323",
//       quoteVolume: "119.875648",
//       start: "2024-08-19 14:00:00",
//       trades: "3",
//       volume: "3730.61",
//     },
//     {
//       close: "0.0316",
//       end: "2024-08-19 16:00:00",
//       high: "0.0321",
//       low: "0.0315",
//       open: "0.0321",
//       quoteVolume: "597.845263",
//       start: "2024-08-19 15:00:00",
//       trades: "14",
//       volume: "18825.22",
//     },
//     {
//       close: "0.0314",
//       end: "2024-08-19 17:00:00",
//       high: "0.0315",
//       low: "0.0314",
//       open: "0.0315",
//       quoteVolume: "327.774052",
//       start: "2024-08-19 16:00:00",
//       trades: "4",
//       volume: "10434.62",
//     },
//     {
//       close: "0.0309",
//       end: "2024-08-19 18:00:00",
//       high: "0.0309",
//       low: "0.0309",
//       open: "0.0309",
//       quoteVolume: "40.00005",
//       start: "2024-08-19 17:00:00",
//       trades: "1",
//       volume: "1294.5",
//     },
//     {
//       close: "0.0311",
//       end: "2024-08-19 22:00:00",
//       high: "0.0311",
//       low: "0.0311",
//       open: "0.0311",
//       quoteVolume: "12.14144",
//       start: "2024-08-19 21:00:00",
//       trades: "1",
//       volume: "390.4",
//     },
//     {
//       close: "0.033",
//       end: "2024-08-20 01:00:00",
//       high: "0.033",
//       low: "0.033",
//       open: "0.033",
//       quoteVolume: "9189.40968",
//       start: "2024-08-20 00:00:00",
//       trades: "38",
//       volume: "278466.96",
//     },
//     {
//       close: "0.0335",
//       end: "2024-08-20 02:00:00",
//       high: "0.0335",
//       low: "0.0323",
//       open: "0.033",
//       quoteVolume: "16252.32391",
//       start: "2024-08-20 01:00:00",
//       trades: "59",
//       volume: "492457.46",
//     },
//     {
//       close: "0.034",
//       end: "2024-08-20 03:00:00",
//       high: "0.0341",
//       low: "0.0339",
//       open: "0.0341",
//       quoteVolume: "25815.02906",
//       start: "2024-08-20 02:00:00",
//       trades: "87",
//       volume: "758026.09",
//     },
//     {
//       close: "0.0323",
//       end: "2024-08-20 07:00:00",
//       high: "0.034",
//       low: "0.0323",
//       open: "0.034",
//       quoteVolume: "23874.406691",
//       start: "2024-08-20 06:00:00",
//       trades: "81",
//       volume: "738604.17",
//     },
//     {
//       close: "0.0331",
//       end: "2024-08-20 08:00:00",
//       high: "0.0336",
//       low: "0.0323",
//       open: "0.0327",
//       quoteVolume: "24600.137961",
//       start: "2024-08-20 07:00:00",
//       trades: "92",
//       volume: "743028.39",
//     },
//     {
//       close: "0.0339",
//       end: "2024-08-20 09:00:00",
//       high: "0.0339",
//       low: "0.0339",
//       open: "0.0339",
//       quoteVolume: "102.380034",
//       start: "2024-08-20 08:00:00",
//       trades: "11",
//       volume: "3020.06",
//     },
//     {
//       close: "0.0347",
//       end: "2024-08-20 11:00:00",
//       high: "0.0347",
//       low: "0.0342",
//       open: "0.0345",
//       quoteVolume: "134.204068",
//       start: "2024-08-20 10:00:00",
//       trades: "7",
//       volume: "3895.52",
//     },
//     {
//       close: "0.0352",
//       end: "2024-08-20 14:00:00",
//       high: "0.0352",
//       low: "0.0351",
//       open: "0.0351",
//       quoteVolume: "29962.810426",
//       start: "2024-08-20 13:00:00",
//       trades: "105",
//       volume: "851486.31",
//     },
//     {
//       close: "0.0381",
//       end: "2024-08-20 15:00:00",
//       high: "0.042",
//       low: "0.0375",
//       open: "0.0375",
//       quoteVolume: "19734.583007",
//       start: "2024-08-20 14:00:00",
//       trades: "112",
//       volume: "518391.31",
//     },
//     {
//       close: "0.0373",
//       end: "2024-08-20 16:00:00",
//       high: "0.0384",
//       low: "0.0372",
//       open: "0.0381",
//       quoteVolume: "12667.840521",
//       start: "2024-08-20 15:00:00",
//       trades: "46",
//       volume: "333453.02",
//     },
//     {
//       close: "0.0382",
//       end: "2024-08-20 19:00:00",
//       high: "0.0387",
//       low: "0.0382",
//       open: "0.0387",
//       quoteVolume: "119.999939",
//       start: "2024-08-20 18:00:00",
//       trades: "3",
//       volume: "3116.98",
//     },
//     {
//       close: "0.0366",
//       end: "2024-08-20 20:00:00",
//       high: "0.0366",
//       low: "0.0366",
//       open: "0.0366",
//       quoteVolume: "1.894416",
//       start: "2024-08-20 19:00:00",
//       trades: "1",
//       volume: "51.76",
//     },
//   ]);
// });
