import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import UsersList from "../pages/Users/UsersList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users" element={<UsersList />} />
    </Routes>
  );
}
