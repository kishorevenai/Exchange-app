import React from "react";
import SuccessButton from "../UI-components/SuccessButton";
import PrimaryButton from "../UI-components/PrimaryButton";
import { Link, useLocation } from "react-router-dom";

const AppBar = () => {
  const { pathname } = useLocation();

  return (
    <div className="text-white  border-2 w-full bg-baseBackgroundL1 border-b border-slate-800">
      <div className="flex justify-between items-center p-2">
        <div className="flex">
          <Link to={"/"}>
            <div
              className={`text-xl pl-4 flex flex-col justify-center cursor-pointer text-white`}
            >
              Exchange
            </div>
          </Link>
          <Link to={"/markets"}>
            <div
              className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer 
              ${pathname === "/markets" ? "text-white" : "text-slate-500"}`}
            >
              Markets
            </div>
          </Link>
          <Link to={"/trades"}>
            <div
              className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${
                pathname === "/trades" ? "text-white" : "text-slate-500"
              }`}
            >
              Trade
            </div>
          </Link>
        </div>
        <div className="flex">
          <div className="p-2 mr-2">
            <SuccessButton>Deposit</SuccessButton>
            <PrimaryButton>Withdraw</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBar;
