import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import UsersList from "../pages/Users/UsersList";
import CatsList from "../pages/Cats/CatsList";
import CatDetails from "../pages/Cats/CatDetails"
import Puzzle from "../pages/Puzzle/Puzzle"
import UserDetails from "../pages/Users/UserDetails"
import Dashboard from "../pages/Dashboard/DashboardPage"
import Register from "../pages/Register/RegisterPage";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users" element={<UsersList />} />
      <Route path="/cats" element={<CatsList />} />
      <Route path="/cats/:id" element={<CatDetails />} />
      <Route path="/puzzle" element={<Puzzle/>} />
      <Route path="/users/:id" element={<UserDetails />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
