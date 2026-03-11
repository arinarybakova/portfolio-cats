import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Intro from "../pages/Intro/IntroPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/RegisterPage";
import UsersList from "../pages/Users/UsersList";
import CatsList from "../pages/Cats/CatsList";
import CatDetails from "../pages/Cats/CatDetails";
import Puzzle from "../pages/Puzzle/Puzzle";
import UserDetails from "../pages/Users/UserDetails";
import Dashboard from "../pages/Dashboard/DashboardPage";

import GuestRoute from "../components/routes/GuestRoute";
import AdminRoute from "../components/routes/AdminRoute";
import UserRoute from "../components/routes/UserRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <UsersList />
          </AdminRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <AdminRoute>
            <UserDetails />
          </AdminRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/cats"
        element={
          <UserRoute>
            <CatsList />
          </UserRoute>
        }
      />

      <Route
        path="/cats/:id"
        element={
          <UserRoute>
            <CatDetails />
          </UserRoute>
        }
      />

      <Route
        path="/me"
        element={
          <UserRoute>
            <UserDetails />
          </UserRoute>
        }
      />

      <Route path="/puzzle" element={<Puzzle />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}