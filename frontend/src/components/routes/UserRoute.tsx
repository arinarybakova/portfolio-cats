import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";

type Props = {
  children: React.ReactNode;
};

export default function UserRoute({ children }: Props) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}