import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, isLoggedIn } from "../../utils/auth";

type Props = {
  children: React.ReactNode;
};

export default function GuestRoute({ children }: Props) {
  if (!isLoggedIn()) return <>{children}</>;

  const user = getStoredUser();

  if (String(user?.role).toUpperCase() === "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/me" replace />;
}