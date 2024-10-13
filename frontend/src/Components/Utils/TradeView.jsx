import { useEffect, useReducer, useRef } from "react";
import React from "react";
import { ChartManager } from "./ChartManager";
import { getKlines } from "../../Api/Apis";

const TradeView = ({ market }) => {
  const chartRef = useRef(null);
  const chartManagerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      let klineData = [];

      try {
        klineData = await getKlines(
          market,
          "1h",
          Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000),
          Math.floor(new Date().getTime() / 1000)
        );
      } catch (error) {}

      console.log("CHECKING KLINES", klineData);

      if (chartRef) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }

        const chartManager = new ChartManager(
          chartRef.current,
          [
            ...klineData?.map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              timestamp: new Date(x?.time),
            })),
          ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
          {
            background: "#0e0f14",
            color: "white",
          }
        );

        chartManagerRef.current = chartManager;
      }
    };

    init();
  }, [market, chartRef]);
  return (
    <>
      <div ref={chartRef} className="w-11/12 mx-auto mt-4 h-5/6"></div>;
    </>
  );
};

export default TradeView;
