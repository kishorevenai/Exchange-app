import React from "react";
import { Outlet } from "react-router-dom";
import AppBar from "./AppBar";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col justify-between items-center w-full">
      <AppBar />
      <div className="flex w-full overflow-y-auto justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
