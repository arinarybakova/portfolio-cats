import React from "react";
import { Navigate } from "react-router-dom";
import { isAdmin, isLoggedIn } from "../../utils/auth";

type Props = {
  children: React.ReactNode;
};

export default function AdminRoute({ children }: Props) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/me" replace />;
  }

  return <>{children}</>;
}