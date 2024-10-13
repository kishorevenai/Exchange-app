const AskTable = ({ asks }) => {
  console.log(asks);
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15).reverse();
  const maxTotal = relevantAsks.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );
  const askWithTotal = relevantAsks.map(([price, quantity]) => [
    price,
    quantity,
    (currentTotal += Number(quantity)),
  ]);

  askWithTotal.reverse();

  return (
    <div>
      {askWithTotal.map(([price, quantity, total]) => (
        <Ask
          maxTotal={maxTotal}
          key={price}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function Ask({ price, quantity, total, maxTotal }) {
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
          background: "rgba(228, 75, 68, 0.325)",
          transition: "width 0.3s ease-in-out",
        }}
      ></div>
      <div className={`flex justify-between text-xs w-full`}>
        <div className="text-[rgba(253,75,78,.9)] text-[10px] font-bold">
          {price}
        </div>
        <div className="text-white">{quantity}</div>
        <div className="text-white">{total.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default AskTable;
