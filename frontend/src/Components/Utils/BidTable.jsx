import React from "react";

const BidTable = ({ bids }) => {
  let currentTotal = 0;
  const relevantBids = bids.slice(0, 15);
  const bidsWithTotal = relevantBids.map(([price, quantity]) => [
    price,
    quantity,
    (currentTotal += Number(quantity)),
  ]);

  const maxTotal = relevantBids.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );

  return (
    <div>
      {bidsWithTotal?.map(([price, quantity, total]) => (
        <Bid
          maxTotal={maxTotal}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function Bid({ price, quantity, total, maxTotal }) {
  return (
    <div
      className="w-11/12 mx-auto"
      style={{
        display: "flex",
        position: "relative",

        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${(100 * total) / maxTotal}%`,
          height: "100%",
          background: "rgba(1, 167, 129, 0.325)",
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
      <div className={`flex justify-between text-xs w-full`}>
        <div className="text-[rgba(0,194,120,.9)] text-[10px] font-bold">
          {price}
        </div>
        <div className="text-white">{quantity}</div>
        <div className="text-white">{total.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default BidTable;
