import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "60px",
      background: "linear-gradient(90deg, #6a11cb, #2575fc)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      boxSizing: "border-box",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      zIndex: 100,
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ margin: 0 }}>Portfolio Cats</h2>
      <div>
        <Link to="/login" style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
        <Link to="/users" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Users</Link>
        <Link to="/cats" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Cats</Link>
      </div>
    </nav>
  );
}
