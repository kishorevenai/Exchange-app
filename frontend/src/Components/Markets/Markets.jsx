import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTickers } from "../../Api/Apis";

const Markets = () => {
  const [tickers, setTickers] = useState();

  useEffect(() => {
    getTickers().then((m) => setTickers(m));
  }, []);

  return (
    <div className="flex mt-[40%] mb-[5%] rounded-md mx-auto flex-col flex-1 max-w-[1280px] w-full">
      <div className="flex flex-col min-w-[700px] flex-1 w-full">
        <div className="flex flex-col w-full rounded-lg bg-baseBackgroundL1 px-5 py-3">
          <table className="w-full table-auto">
            <MarketHeader />
            {tickers?.map((m) => (
              <MarketRow market={m} />
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

function MarketRow({ market }) {
  const router = useNavigate();
  return (
    <tr
      className="cursor-pointer text-white border-t border-baseBorderLight hover:bg-white/7 w-full"
      onClick={() => router(`/trades/${market.symbol}`)}
    >
      <td className="px-1 py-3">
        <div className="flex shrink">
          <div className="flex items-center undefined">
            <div
              className="relative flex-none overflow-hidden rounded-full border border-baseBorderMed"
              style={{ width: "40px", height: "40px" }}
            >
              <Link to={"/trades/TATA_INR"}>
                <div className="relative">
                  <img
                    alt={market.symbol}
                    src={
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
                    }
                    loading="lazy"
                    width="40"
                    height="40"
                    decoding="async"
                    data-nimg="1"
                    className=""
                  />
                </div>
              </Link>
            </div>
            <div className="ml-4 flex flex-col">
              <p className="whitespace-nowrap text-base font-medium text-baseTextHighEmphasis">
                {market.symbol}
              </p>
              <div className="flex items-center justify-start flex-row gap-2">
                <p className="flex-medium text-left text-xs leading-5 text-baseTextMedEmphasis">
                  {market.symbol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums">{market.lastPrice}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums">{market.high}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums">{market.volume}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-greenText">
          {Number(market.priceChangePercent)?.toFixed(3)} %
        </p>
      </td>
    </tr>
  );
}

function MarketHeader() {
  return (
    <thead className="text-white">
      <tr className="">
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">
          <div className="flex items-center gap-1 cursor-pointer select-none">
            Name<span className="w-[16px]"></span>
          </div>
        </th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">
          <div className="flex items-center gap-1 cursor-pointer select-none">
            Price<span className="w-[16px]"></span>
          </div>
        </th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">
          <div className="flex items-center gap-1 cursor-pointer select-none">
            Market Cap<span className="w-[16px]"></span>
          </div>
        </th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">
          <div className="flex items-center gap-1 cursor-pointer select-none">
            24h Volume
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-down h-4 w-4"
            >
              <path d="M12 5v14"></path>
              <path d="m19 12-7 7-7-7"></path>
            </svg>
          </div>
        </th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">
          <div className="flex items-center gap-1 cursor-pointer select-none">
            24h Change<span className="w-[16px]"></span>
          </div>
        </th>
      </tr>
    </thead>
  );
}

export default Markets;
