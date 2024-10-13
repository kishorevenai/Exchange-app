import axios from "axios";
const BASE_URL = "http://localhost:3600/api/v1";

export async function getTicker(market) {
  const tickers = await getTickers();
  const ticker = tickers.find((t) => t.symbol === market);
  if (!ticker) {
    throw new Error(`No ticker found for ${market}`);
  }

  return ticker;
}

export async function getTickers() {
  const response = await axios.get(`${BASE_URL}/tickers`);
  return response.data;
}

export async function getDepth(market) {
  const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
  return response.data;
}

export async function getTrades(market) {
  const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
  return response.data;
}

export async function placeOrder(order) {
  const response = await axios.post(`${BASE_URL}/order`, {
    ...order,
  });
  return response.data;
}

export async function getOrders(order) {
  const response = await axios.get(
    `${BASE_URL}/order/open?userId=${order.userId}&market=${order.market}`
  );

  console.log("order", response);

  return response.data;
}

export async function getKlines(market, interval, startTime, endTime) {
  const response = await axios.get(
    `${BASE_URL}/kline?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
  );

  const data = response.data;

  return data.sort((x, y) => (Number(x.end) < Number(x.end) ? -1 : 1));
}
