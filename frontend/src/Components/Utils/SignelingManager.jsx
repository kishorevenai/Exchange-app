export const BASE_URL = "ws://localhost:3700";

export class SignelingManager {
  #ws;
  static #instance;
  #bufferedMessages = [];
  #callbacks = {};
  #id = 0;
  #initialized = false;

  constructor() {
    this.#ws = new WebSocket(BASE_URL);
    this.#bufferedMessages = [];
    this.#id = 1;
    this.init();
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new SignelingManager();
    }
    return this.#instance;
  }

  init() {
    this.#ws.onopen = () => {
      this.#initialized = true;
      this.#bufferedMessages.forEach((message) => {
        this.#ws.send(JSON.stringify(message));
      });
      this.#bufferedMessages = [];
    };

    this.#ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log("CHECKING THE TICKER", message);

      const type = message?.data?.e;
      if (this.#callbacks[type]) {
        this.#callbacks[type].forEach(({ callback }) => {
          if (type === "ticker") {
            const newTicker = {
              firstPrice: message.data.firstPrice,
              lastPrice: message.data.c,
              high: message.data.h,
              low: message.data.l,
              volume: message.data.v,
              quoteVolume: message.data.V,
              symbol: message.data.s,
              priceChange: message.data.priceChange,
              priceChangePercent: message.data.priceChangePercent,
              quoteVolume: message.data.quoteVolume,
            };

            console.log(newTicker);
            callback(newTicker);
          }

          if (type === "depth") {
            console.log("checking depth", message);
            const updatedBids = message.data.b;
            const updatedAsks = message.data.a;
            callback({ bids: updatedBids, asks: updatedAsks });
          }

          if (type === "trade") {
            callback(message.data);
          }
        });
      }
    };
  }

  sendMessage(message) {
    const messageToSend = {
      ...message,
      id: this.#id++,
    };

    if (!this.#initialized) {
      this.#bufferedMessages.push(messageToSend);
      return;
    }
    this.#ws.send(JSON.stringify(messageToSend));
  }

  async registerCallBack(type, callback, id) {
    this.#callbacks[type] = this.#callbacks[type] || [];
    this.#callbacks[type].push({
      callback,
      id,
    });
  }

  async deRegisterCallback(type, id) {
    if (this.#callbacks[type]) {
      const index = this.#callbacks[type].findIndex(
        (callback) => callback.id === id
      );

      if (index !== -1) {
        this.#callbacks[type].splice(index, 1);
      }
    }
  }
}
