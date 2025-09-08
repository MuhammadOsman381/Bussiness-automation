import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

const RouteProtector = ({
  children,
  isAuthRequired,
}: {
  children: ReactNode;
  isAuthRequired: boolean;
}) => {
  const location = useLocation();
  const pathname = location.pathname;

  const token = localStorage.getItem("Authorization")?.split("Bearer ")[1];
  const type = localStorage.getItem("type");

  if (isAuthRequired && !token) {
    const searchParams = new URLSearchParams();
    searchParams.append("after_login", pathname);
    localStorage.setItem("after_login", searchParams as any);
    return <Navigate to={`/login?${searchParams}`} replace />;
  }

  if (!isAuthRequired && token && type) {
    if (type === "recruiter") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    if (type === "applicant") {
      return <Navigate to="/applicant/prescreen_interview" replace />;
    }
  }

  if (token) {
    if (pathname.startsWith("/recruiter") && type !== "recruiter") {
      return <Navigate to="/applicant/prescreen" replace />;

    }
    if (pathname.startsWith("/applicant") && type !== "applicant") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
  }

  return children;
};

export default RouteProtector;
