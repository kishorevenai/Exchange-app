import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./Components/Appbar/Layout";
import Markets from "./Components/Markets/Markets";
import Page from "./Components/Markets/Page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="markets" element={<Markets />}></Route>
        <Route path="trades/:market" element={<Page />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
