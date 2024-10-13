import { Client } from "pg";

const client = new Client({
  user: "trade",
  host: "localhost",
  database: "trade",
  password: "trade",
  port: 5433,
});
client.connect();

async function refreshViews() {
  await client.query("REFRESH MATERIALIZED VIEW klines_1m");
  await client.query("REFRESH MATERIALIZED VIEW klines_1h");
  await client.query("REFRESH MATERIALIZED VIEW klines_1w");

  console.log("Materialized views refreshed successfully");
}

refreshViews().catch(console.error);

setInterval(() => {
  refreshViews();
}, 1000 * 10);
