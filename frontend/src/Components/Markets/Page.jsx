import React from "react";
import MarketBar from "../Utils/MarketBar";
import Depth from "../Utils/Depth";
import TradeView from "../Utils/TradeView";
import SwapUI from "../Utils/SwapUI";
import { useParams } from "react-router-dom";

const Page = () => {
  const { market } = useParams();

  return (
    <div className="flex h-full max-h-[850px] flex-row flex-1">
      <div className="flex flex-col flex-1">
        <MarketBar market={market} />
        <div className="flex flex-row h-[920px] border-y border-slate-800">
          <div className="flex flex-col flex-1">
            <TradeView market={market} />
          </div>
          <div className="flex flex-col w-[250px] overflow-hidden">
            <Depth market={market} />
          </div>
        </div>
      </div>
      <div className="w-[10px] flex-col border-slate-800 border-l"></div>
      <div className="h-full">
        <div className="flex flex-col w-[250px]">
          <SwapUI market={market} />
        </div>
      </div>
    </div>
  );
};

export default Page;
