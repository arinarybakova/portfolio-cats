import React from "react";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: "80px" }}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
