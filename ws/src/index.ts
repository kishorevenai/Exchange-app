import { WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({ port: 3700 });

wss.on("connection", (ws) => {
  UserManager.getInstance().addUser(ws);
  // ws.on("message", (message) => {
  //   let result;
  //   const parsedMessage: any = JSON.parse(message);
  //   setInterval(() => {
  //     ws.send(
  //       JSON.stringify({
  //         data: {
  //           e: "ticker",
  //           c: (Math.random() * 10).toFixed(2),
  //           h: (Math.random() * 10).toFixed(2),
  //           l: (Math.random() * 10).toFixed(2),
  //           v: (Math.random() * 10).toFixed(2),
  //           V: (Math.random() * 10).toFixed(2),
  //           s: (Math.random() * 10).toFixed(2),
  //         },
  //       })
  //     );
  //   }, 1000);
  //   setInterval(() => {
  //     ws.send(
  //       JSON.stringify({
  //         data: {
  //           e: "depth",
  //           b: [
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //           ].reverse(),
  //           a: [
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //             [Math.random().toFixed(4), Math.floor(Math.random() * 1000)],
  //           ],
  //         },
  //       })
  //     );
  //   }, 500);
  // });
  // ws.on("message", (message) => {
  //   console.log("=======>", JSON.stringify(message.toString()));
  // });A
});
