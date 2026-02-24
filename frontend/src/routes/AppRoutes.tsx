import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import UsersList from "../pages/Users/UsersList";
import CatsList from "../pages/Cats/CatsList";
import CatDetails from "../pages/Cats/CatDetails"


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users" element={<UsersList />} />
      <Route path="/cats" element={<CatsList />} />
      <Route path="/cats/:id" element={<CatDetails />} />
    </Routes>
  );
}
