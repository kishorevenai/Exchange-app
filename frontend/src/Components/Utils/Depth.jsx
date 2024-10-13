import { useState, useEffect } from "react";
import { SignelingManager } from "./SignelingManager";
import { getDepth, getTicker, getTrades } from "../../Api/Apis";
import BidTable from "./BidTable";
import AskTable from "./AskTable";

const Depth = ({ market }) => {
  const [bids, setBids] = useState();
  const [asks, setAsks] = useState();
  const [price, setPrice] = useState();

  useEffect(() => {
    SignelingManager.getInstance().registerCallBack(
      "trade",
      (data) => {
        setPrice(data?.p);
      },
      `TRADE-${market}`
    );
    SignelingManager.getInstance().registerCallBack(
      "depth",
      (data) => {
        setBids((originalBids) => {
          const bidsAfterUpdate = [...(originalBids || [])];

          for (let i = 0; i < bidsAfterUpdate.length; i++) {
            for (let j = 0; j < data.bids.length; j++) {
              if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                bidsAfterUpdate[i][1] = data.bids[j][1];
                if (Number(bidsAfterUpdate[i][1]) === 0) {
                  bidsAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.bids.length; j++) {
            if (
              Number(data.bids[j][1]) !== 0 &&
              !bidsAfterUpdate.map((x) => x[0]).includes(data.bids[j][0])
            ) {
              bidsAfterUpdate.push(data.bids[j]);
              break;
            }
          }
          bidsAfterUpdate.sort((x, y) =>
            Number(y[0]) > Number(x[0]) ? 1 : -1
          );
          return bidsAfterUpdate;
        });

        setAsks((originalAsks) => {
          const asksAfterUpdate = [...(originalAsks || [])];

          for (let i = 0; i < asksAfterUpdate.length; i++) {
            for (let j = 0; j < data.asks.length; j++) {
              if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                asksAfterUpdate[i][1] = data.asks[j][1];
                if (Number(asksAfterUpdate[i][1]) === 0) {
                  asksAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.asks.length; j++) {
            if (
              Number(data.asks[j][1]) !== 0 &&
              !asksAfterUpdate.map((x) => x[0]).includes(data.asks[j][0])
            ) {
              asksAfterUpdate.push(data.asks[j]);
              break;
            }
          }
          asksAfterUpdate.sort((x, y) =>
            Number(y[0]) > Number(x[0]) ? 1 : -1
          );
          return asksAfterUpdate;
        });
      },
      `DEPTH-${market}`
    );

    SignelingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth@${market}`],
    });

    SignelingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade@${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.payload.bids.reverse());
      setAsks(d.payload.asks);
    });

    getTicker(market).then((t) => setPrice(t.lastPrice));
    // getTrades(market).then((t) => setPrice(t[0].price));
  }, []);

  return (
    <div>
      <TableHeader />
      {asks && <AskTable asks={asks} />}
      {price && (
        <div className="w-11/12 mx-auto text-white font-bold">{price}</div>
      )}
      {bids && <BidTable bids={bids} />}
    </div>
  );
};

function TableHeader() {
  return (
    <div className="flex justify-between mb-5  w-11/12 mx-auto text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}

export default Depth;
